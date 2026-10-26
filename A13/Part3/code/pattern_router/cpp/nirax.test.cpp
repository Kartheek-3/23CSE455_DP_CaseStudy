#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <memory>
#include "nirax.hpp"

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

static std::string describe(const Resolved& res) {
    std::string text = res.component;
    for (const auto& [key, value] : res.params) text += " " + key + "=" + value;
    if (!res.query.empty()) text += " query=" + res.query;
    if (!res.hash.empty()) text += " hash=" + res.hash;
    return text + (res.popup ? " popup" : "");
}

static std::string run(const std::string& text) {
    std::vector<Route> routes = {{"/", "home", false}, {"/notes/:id", "note-detail", false},
                                 {"/settings", "settings", true}, {"/search", "search", false}};
    bool loggedIn = false;
    std::unique_ptr<Router> router;
    int changes = 0;
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ');
        if (parts[0] == "login") {
            loggedIn = parts[1] == "on";
        } else if (parts[0] == "nav") {
            if (!router) {
                router = std::make_unique<Router>(routes, loggedIn, "notfound");
                router->onChange([&changes](const Resolved&) { ++changes; });
            }
            out.push_back(describe(router->navigate(parts[1])));
        }
    }
    out.push_back("changes=" + std::to_string(changes));
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
