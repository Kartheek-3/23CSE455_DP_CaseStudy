#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <set>
#include <stdexcept>
#include "job_queue.hpp"

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

class FakeTransport : public Transport {
public:
    void send(const std::string& url, const std::string&) override {
        size_t start = url.find("//") + 2;
        std::string host = url.substr(start, url.find('/', start) - start);
        auto endsWith = [&](const std::string& suffix) {
            return host.size() >= suffix.size() && host.compare(host.size() - suffix.size(), suffix.size(), suffix) == 0;
        };
        if (endsWith(".down")) throw std::runtime_error("unreachable");
        if (endsWith(".flaky") && tried_.insert(url).second) throw std::runtime_error("timeout");
    }

private:
    std::set<std::string> tried_;
};

static std::string run(const std::string& text) {
    JobQueue queue;
    std::set<std::string> blocked;
    FakeTransport transport;
    DeliverService service(queue);
    DeliverProcessor processor(blocked, transport);
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ', 3);
        if (parts[0] == "add") {
            service.deliver(parts[1], parts[2]);
        } else if (parts[0] == "block") {
            blocked.insert(parts[1]);
        } else if (parts[0] == "run") {
            for (const auto& r : queue.run([&](const Job& job) { return processor.process(job); }))
                out.push_back(std::to_string(r.id) + ":" + r.label + ":" + r.result + "@" + std::to_string(r.attempts));
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
