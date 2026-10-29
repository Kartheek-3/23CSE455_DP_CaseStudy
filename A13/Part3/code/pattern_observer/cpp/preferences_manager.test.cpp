#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <stdexcept>
#include "preferences_manager.hpp"

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
    PreferencesManager manager;
    std::vector<std::string> out;
    std::map<std::string, int> handles;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ');
        try {
            if (parts[0] == "on") {
                std::string name = parts[1];
                handles[name] = manager.on([name, &out](const CommitEvent& event) {
                    if (name == "boom") throw std::runtime_error("listener failed");
                    out.push_back(name + ":" + event.key + "=" + event.value + "(oldValue=" + event.oldValue + ")");
                });
            } else if (parts[0] == "off") {
                auto it = handles.find(parts[1]);
                if (it != handles.end()) manager.off(it->second);
            } else if (parts[0] == "commit") {
                manager.commit(parts[1], parts[2]);
            }
        } catch (const std::runtime_error& e) {
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
