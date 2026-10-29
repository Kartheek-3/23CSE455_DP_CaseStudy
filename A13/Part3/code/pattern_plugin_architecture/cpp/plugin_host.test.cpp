#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <cctype>
#include <stdexcept>
#include "plugin_host.hpp"

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

static std::function<void(const PluginHost::Registrar&)> pluginSetup(const std::string& name) {
    return [name](const PluginHost::Registrar& addHandler) {
        if (name == "upper") {
            addHandler("note_view_interruptor", [](const std::string& t) {
                std::string s = t;
                std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c) { return std::toupper(c); });
                return s;
            });
        } else if (name == "exclaim") {
            addHandler("note_view_interruptor", [](const std::string& t) { return t + "!"; });
        } else if (name == "share") {
            addHandler("note_action", [](const std::string&) { return std::string("Share"); });
        } else if (name == "bad") {
            addHandler("note_view_interruptor", [](const std::string& t) { return t + "?"; });
            throw std::runtime_error("boom");
        }
    };
}

static std::string run(const std::string& text) {
    PluginHost host;
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ');
        try {
            if (parts[0] == "install") {
                host.install(parts[1], pluginSetup(parts[1]));
            } else if (parts[0] == "abort") {
                host.abort(parts[1]);
            } else if (parts[0] == "view") {
                std::string value = parts[1];
                for (const auto& fn : host.getHandlers("note_view_interruptor")) value = fn(value);
                out.push_back(value);
            } else if (parts[0] == "actions") {
                std::vector<std::string> labels;
                for (const auto& fn : host.getHandlers("note_action")) labels.push_back(fn(""));
                out.push_back(join(labels, ","));
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
