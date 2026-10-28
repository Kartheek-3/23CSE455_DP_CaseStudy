#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <optional>
#include "repository.hpp"

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

static std::string show(const Entity& entity) {
    std::vector<std::string> fields;
    for (const auto& [key, value] : entity) fields.push_back(key + "=" + value);
    return "{" + join(fields, ",") + "}";
}

static std::string run(const std::string& text) {
    UsersRepository repository;
    UserService service(repository);
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ');
        try {
            if (parts[0] == "insert") {
                out.push_back(show(service.registerUser(parts[1])));
            } else if (parts[0] == "find") {
                auto found = service.findByName(parts[1]);
                out.push_back(found ? show(*found) : "none");
            } else if (parts[0] == "findorfail") {
                out.push_back(show(service.getByName(parts[1])));
            } else if (parts[0] == "count") {
                out.push_back(std::to_string(service.count()));
            }
        } catch (const EntityNotFound& e) {
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
