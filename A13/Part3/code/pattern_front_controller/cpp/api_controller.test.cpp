#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <optional>
#include "api_controller.hpp"

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

static ApiController build() {
    std::map<std::string, std::string> tokens = {{"t-alice", "alice"}, {"t-bob", "bob"}};
    ApiController controller([tokens](const std::string& token) -> std::optional<std::string> {
        auto it = tokens.find(token);
        if (it == tokens.end()) return std::nullopt;
        return it->second;
    });
    controller.registerEndpoint({"ping", false, [](const std::string&, const std::optional<std::string>&) { return std::string("pong"); }});
    controller.registerEndpoint({"notes/create", true, [](const std::string& body, const std::optional<std::string>& user) {
        return "created " + body + " by " + *user;
    }});
    controller.registerEndpoint({"i", true, [](const std::string&, const std::optional<std::string>& user) { return *user; }});
    return controller;
}

static std::string run(const std::string& text) {
    ApiController controller = build();
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ', 4);
        Response response = controller.handle(parts[1], parts[2], parts.size() > 3 ? parts[3] : "");
        out.push_back(std::to_string(response.status) + " " + response.text);
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
