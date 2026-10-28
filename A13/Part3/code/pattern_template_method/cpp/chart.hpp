#pragma once
#include <algorithm>
#include <map>
#include <string>
#include <vector>

using Columns = std::map<std::string, int>;

class Chart {
public:
    virtual ~Chart() = default;

    Columns tick(bool major, const std::string& group = "") {
        Columns data = major ? tickMajor(group) : tickMinor(group);
        Columns columns;
        for (const auto& [key, value] : data) {
            std::string name = key;
            std::replace(name.begin(), name.end(), '.', '_');
            columns["___" + name] = std::clamp(value, 0, kRangeMax);
        }
        if (!columns.empty()) rows_.push_back(columns);
        return columns;
    }

protected:
    virtual Columns tickMajor(const std::string& group) = 0;
    virtual Columns tickMinor(const std::string& group) = 0;

private:
    static constexpr int kRangeMax = 1000;
    std::vector<Columns> rows_;
};

class UsersChart : public Chart {
protected:
    Columns tickMajor(const std::string&) override { return {{"total", 1500}, {"local.total", 40}}; }
    Columns tickMinor(const std::string&) override { return {{"local.total", 41}}; }
};

class NotesChart : public Chart {
protected:
    Columns tickMajor(const std::string&) override { return {{"total", -5}}; }
    Columns tickMinor(const std::string&) override { return {}; }
};
