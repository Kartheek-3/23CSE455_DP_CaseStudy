// Strategy: setpoint schedule calculation.
// Derived from mycodo/utils/method.py (AbstractMethod, DailySineMethod, DurationMethod, CascadeMethod,
// create_method_handler, sine_wave_y_out). Times are plain seconds; method data rows are number vectors
// instead of database rows; CascadeMethod receives (and owns) its linked strategies directly.
#pragma once
#include <cmath>
#include <memory>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

struct Setpoint {
    bool has_value;  // false = None
    double value;
    bool ended;
};

// Strategy interface; also the neutral fallback strategy for unknown method types.
class AbstractMethod {
public:
    virtual ~AbstractMethod() = default;
    virtual Setpoint calculate_setpoint(double /*now*/, double /*method_start_time*/) const {
        return {false, 0.0, false};
    }
};

inline double sine_wave_y_out(double amplitude, double frequency, double shift_angle, double shift_y, double angle_in) {
    const double pi = std::acos(-1.0);
    return amplitude * std::sin(frequency * (angle_in - shift_angle) * pi / 180.0) + shift_y;
}

class DailySineMethod : public AbstractMethod {
public:
    DailySineMethod(double amplitude, double frequency, double shift_angle, double shift_y)
        : amplitude_(amplitude), frequency_(frequency), shift_angle_(shift_angle), shift_y_(shift_y) {}
    Setpoint calculate_setpoint(double now, double /*method_start_time*/) const override {
        const long long seconds = static_cast<long long>(std::floor(now));
        const double seconds_of_day = static_cast<double>(((seconds % 86400) + 86400) % 86400);
        const double angle = seconds_of_day / 86400 * 360;
        return {true, sine_wave_y_out(amplitude_, frequency_, shift_angle_, shift_y_, angle), false};
    }

private:
    double amplitude_, frequency_, shift_angle_, shift_y_;
};

// Rows {duration_sec, setpoint_start, setpoint_end}; a row with duration 0 is the repeat row.
class DurationMethod : public AbstractMethod {
public:
    explicit DurationMethod(std::vector<std::vector<double>> rows) : method_data_all_(std::move(rows)) {}
    double cycle_duration() const {
        double total = 0;
        for (const auto& row : method_data_all_) total += row[0];
        return total;
    }
    Setpoint calculate_setpoint(double now, double method_start_time) const override {
        const double duration_in_seconds = cycle_duration();
        double seconds_from_start = now - method_start_time;
        if (seconds_from_start >= duration_in_seconds) {
            const std::vector<double>* repeat_row = nullptr;
            for (const auto& row : method_data_all_) if (row[0] == 0 && !repeat_row) repeat_row = &row;
            if (!repeat_row || (0 < (*repeat_row)[2] && (*repeat_row)[2] <= seconds_from_start)) return {false, 0.0, true};
            seconds_from_start = std::fmod(seconds_from_start, duration_in_seconds);
        }
        double total_sec = 0, previous_total_sec = 0;
        for (const auto& row : method_data_all_) {
            total_sec += row[0];
            if (previous_total_sec <= seconds_from_start && seconds_from_start < total_sec) {
                const double percent_row = (seconds_from_start - previous_total_sec) / row[0];
                const double setpoint_diff = std::fabs(row[2] - row[1]);
                return {true, row[1] < row[2] ? row[1] + setpoint_diff * percent_row : row[1] - setpoint_diff * percent_row, false};
            }
            previous_total_sec = total_sec;
        }
        return {true, previous_total_sec, false};
    }

private:
    std::vector<std::vector<double>> method_data_all_;
};

// Context: multiplies the setpoints of its linked strategies (each taken as a percentage).
class CascadeMethod : public AbstractMethod {
public:
    explicit CascadeMethod(std::vector<std::unique_ptr<AbstractMethod>> linked) : linked_methods_(std::move(linked)) {}
    Setpoint calculate_setpoint(double now, double method_start_time) const override {
        double setpoint = 1.0;
        for (const auto& linked_method : linked_methods_) {
            const Setpoint linked = linked_method->calculate_setpoint(now, method_start_time);
            if (linked.has_value) setpoint *= linked.value / 100.0;
            if (linked.ended) return {false, 0.0, true};
        }
        return {true, setpoint * 100.0, false};
    }

private:
    std::vector<std::unique_ptr<AbstractMethod>> linked_methods_;
};

// Selects the strategy for a method type; unknown types fall back to AbstractMethod.
inline std::unique_ptr<AbstractMethod> create_method_handler(
        const std::string& method_type, const std::vector<std::vector<double>>& rows,
        std::vector<std::unique_ptr<AbstractMethod>> linked_methods = {}) {
    if (method_type == "DailySine") {
        if (rows.size() != 1 || rows[0].size() != 4) throw std::invalid_argument("DailySine needs exactly one row of 4 numbers");
        return std::unique_ptr<AbstractMethod>(new DailySineMethod(rows[0][0], rows[0][1], rows[0][2], rows[0][3]));
    }
    if (method_type == "Duration") {
        for (const auto& row : rows)
            if (row.size() != 3) throw std::invalid_argument("Duration rows need exactly 3 numbers");
        return std::unique_ptr<AbstractMethod>(new DurationMethod(rows));
    }
    if (method_type == "Cascade") return std::unique_ptr<AbstractMethod>(new CascadeMethod(std::move(linked_methods)));
    return std::unique_ptr<AbstractMethod>(new AbstractMethod());
}
