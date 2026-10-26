#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <optional>
#include "federated_instance_service.hpp"

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
    InMemoryInstanceRepository repo;
    KeyValueCache cache;
    FederatedInstanceService service(repo, cache);
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ');
        if (parts[0] == "dropcache") {
            cache.dispose();
            continue;
        }
        int finds = repo.finds, inserts = repo.inserts;
        std::optional<Instance> result;
        if (parts[0] == "fetch") result = service.fetchOrRegister(parts[1]);
        else result = service.lookup(parts[1]);
        std::string source = repo.inserts > inserts ? "insert" : repo.finds > finds ? "db" : "cache";
        out.push_back((result ? result->host + "#" + std::to_string(result->id) : "none") + "@" + source);
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
