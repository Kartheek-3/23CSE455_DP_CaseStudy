#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include "event_bus.hpp"

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
    Broker broker;
    GlobalEventService events(broker);
    std::vector<std::string> out;
    std::map<std::string, int> tokens;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ', 4);
        if (parts[0] == "sub") {
            std::string name = parts[1];
            tokens[name + " " + parts[2]] = broker.subscribe(parts[2], [name, &out](const std::string& channel, const std::string& message) {
                out.push_back(name + "<-" + channel + ":" + message);
            });
        } else if (parts[0] == "unsub") {
            broker.unsubscribe(parts[2], tokens[parts[1] + " " + parts[2]]);
        } else if (parts[0] == "main") {
            if (events.publishMainStream(parts[1], parts[2], parts[3]) == 0) out.push_back("dropped:mainStream:" + parts[1]);
        } else if (parts[0] == "broadcast") {
            auto three = splitN(command, ' ', 3);
            if (events.publishBroadcastStream(three[1], three[2]) == 0) out.push_back("dropped:broadcast");
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
