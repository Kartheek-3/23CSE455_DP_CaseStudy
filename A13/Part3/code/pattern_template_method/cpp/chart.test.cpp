#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <stdexcept>
#include "chart.hpp"

static std::vector<std::string> splitN(const std::string& s, char d, size_t n = 0) {
    std::vector<std::string> out;
    size_t start = 0, pos;
    while ((n == 0 || out.size() + 1 < n) && (pos = s.find(d, start)) != std::string::npos) {
        out.push_back(s.substr(start, pos - start));
        start = pos + 1;
    }
    out.push_back(s.substr(start));
    return out;
}

static std::string join(const std::vector<std::string>& v, const std::string& sep) {
    std::string r;
    for (size_t i = 0; i < v.size(); ++i) r += (i ? sep : "") + v[i];
    return r;
}

class FaultyChart : public Chart {
protected:
    Columns tickMajor(const std::string&) override { throw std::runtime_error("source unavailable"); }
    Columns tickMinor(const std::string&) override { return {}; }
};

static std::string run(const std::string& text) {
    auto parts = splitN(text, ' ');
    std::unique_ptr<Chart> chart;
    if (parts[0] == "users") chart = std::make_unique<UsersChart>();
    else if (parts[0] == "notes") chart = std::make_unique<NotesChart>();
    else chart = std::make_unique<FaultyChart>();
    try {
        Columns columns = chart->tick(parts[1] == "major");
        std::vector<std::string> out;
        for (const auto& [key, value] : columns) out.push_back(key + "=" + std::to_string(value));
        return out.empty() ? "none" : join(out, ",");
    } catch (const std::runtime_error& e) {
        return std::string("ERR:") + e.what();
    }
}

int main(int, char** argv) {
    std::ifstream in(argv[1]);
    std::string line;
    int passed = 0, total = 0;
    while (std::getline(in, line)) {
        if (line.empty() || line[0] == '#') continue;
        auto f = splitN(line, '|', 3);
        ++total;
        std::string got = run(f[1]);
        bool ok = got == f[2];
        if (ok) ++passed;
        std::cout << (ok ? "PASS " : "FAIL ") << f[0] << (ok ? "" : ": expected [" + f[2] + "] got [" + got + "]") << "\n";
    }
    std::cout << "passed " << passed << "/" << total << "\n";
    return passed == total ? 0 : 1;
}
