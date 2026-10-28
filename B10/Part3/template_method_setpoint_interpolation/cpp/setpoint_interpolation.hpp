// Template Method: date/daily setpoint interpolation.
// Derived from mycodo/utils/method.py (DateMethod.calculate_setpoint with the ignore_date hook,
// DailyMethod overriding the hook). Method rows are plain structs instead of database rows.
#pragma once
#include <cctype>
#include <cmath>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

struct MethodRow {
    std::string time_start;
    std::string time_end;
    double setpoint_start;
    bool has_setpoint_end;
    double setpoint_end;
};

struct Setpoint {
    bool has_value;  // false = None (no row matches)
    double value;
    bool ended;
};

namespace detail {
inline int field(const std::string& text, std::size_t pos, std::size_t len) {
    int value = 0;
    for (std::size_t i = pos; i < pos + len; ++i) {
        if (!std::isdigit(static_cast<unsigned char>(text[i])))
            throw std::invalid_argument("time data '" + text + "' does not match format");
        value = value * 10 + (text[i] - '0');
    }
    return value;
}

inline long long days_from_civil(int y, int m, int d) {  // days since 1970-01-01
    y -= m <= 2;
    const long long era = (y >= 0 ? y : y - 399) / 400;
    const long long yoe = y - era * 400;
    const long long doy = (153 * (m + (m > 2 ? -3 : 9)) + 2) / 5 + d - 1;
    return era * 146097 + yoe * 365 + yoe / 4 - yoe / 100 + doy - 719468;
}

// Parse "YYYY-MM-DD HH:MM:SS" (with_date) or "HH:MM:SS" into seconds; throw on a bad format.
inline long long parse_seconds(const std::string& t, bool with_date) {
    const std::size_t off = with_date ? 11 : 0;
    if (t.size() != off + 8 || t[off + 2] != ':' || t[off + 5] != ':' ||
        (with_date && (t[4] != '-' || t[7] != '-' || t[10] != ' ')))
        throw std::invalid_argument("time data '" + t + "' does not match format");
    const int h = field(t, off, 2), mi = field(t, off + 3, 2), s = field(t, off + 6, 2);
    if (h > 23 || mi > 59 || s > 59) throw std::invalid_argument("time data '" + t + "' out of range");
    const long long seconds = h * 3600LL + mi * 60 + s;
    if (!with_date) return seconds;
    const int y = field(t, 0, 4), mo = field(t, 5, 2), d = field(t, 8, 2);
    static const int days[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    const bool leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
    if (mo < 1 || mo > 12 || d < 1 || d > days[mo - 1] + (mo == 2 && leap ? 1 : 0))
        throw std::invalid_argument("time data '" + t + "' out of range");
    return days_from_civil(y, mo, d) * 86400LL + seconds;
}
}  // namespace detail

// A time/date span dictates the setpoint. Defines the template method and the default hook.
class DateMethod {
public:
    explicit DateMethod(std::vector<MethodRow> rows) : method_data_all_(std::move(rows)) {}
    virtual ~DateMethod() = default;

    // Template method (non-virtual): returns (setpoint or None, ended).
    Setpoint calculate_setpoint(const std::string& now_text) const {
        long long now = detail::parse_seconds(now_text, true);
        if (ignore_date()) now %= 86400;
        for (const MethodRow& row : method_data_all_) {
            const long long start_time = detail::parse_seconds(row.time_start, !ignore_date());
            const long long end_time = detail::parse_seconds(row.time_end, !ignore_date());
            if (start_time < now && now < end_time) {
                const double setpoint_start = row.setpoint_start;
                const double setpoint_end = row.has_setpoint_end ? row.setpoint_end : setpoint_start;
                const double setpoint_diff = std::fabs(setpoint_end - setpoint_start);
                const double percent_total =
                    static_cast<double>(now - start_time) / static_cast<double>(end_time - start_time);
                if (setpoint_start < setpoint_end) return {true, setpoint_start + setpoint_diff * percent_total, false};
                return {true, setpoint_start - setpoint_diff * percent_total, false};
            }
        }
        return {false, 0.0, false};
    }

protected:
    // Hook: false means the date part of the date-time is considered.
    virtual bool ignore_date() const { return false; }

private:
    std::vector<MethodRow> method_data_all_;
};

// Repeats every day: only the time of day is compared.
class DailyMethod : public DateMethod {
public:
    using DateMethod::DateMethod;

protected:
    bool ignore_date() const override { return true; }
};
