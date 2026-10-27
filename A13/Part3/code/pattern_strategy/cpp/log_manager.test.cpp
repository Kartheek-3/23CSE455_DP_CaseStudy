#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <memory>
#include "log_manager.hpp"

[[maybe_unused]] static std::vector<std::string> splitN(const std::string& s, char d, size_t n = 0) {
    std::vector<std::string> out;
    size_t start = 0, pos;
    while ((n == 0 || out.size() + 1 < n) && (pos = s.find(d, start)) != std::string::npos) {
        out.push_back(s.substr(start, pos - start));
        start = pos + 1;
    }
    out.push_back(s.substr(start));
    return out;
}

[[maybe_unused]] static std::string join(const std::vector<std::string>& v, const std::string& sep) {
    std::string r;
    for (size_t i = 0; i < v.size(); ++i) r += (i ? sep : "") + v[i];
    return r;
}

static std::string run(const std::string& text) {
    LogManager manager(std::make_shared<BootstrapConsoleBackend>());
    std::map<std::string, std::shared_ptr<LogBackend>> backends = {
        {"bootstrap", std::make_shared<BootstrapConsoleBackend>()},
        {"pretty", std::make_shared<PrettyConsoleBackend>()},
        {"json", std::make_shared<JsonConsoleBackend>()},
        {"null", nullptr}};
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ', 3);
        try {
            if (parts[0] == "set") manager.setBackend(backends[parts[1]]);
            else if (parts[0] == "log") out.push_back(manager.log(parts[1], parts[2]));
        } catch (const std::invalid_argument& e) {
            out.push_back(std::string("ERR:") + e.what());
        }
    }
    return join(out, "~");
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
