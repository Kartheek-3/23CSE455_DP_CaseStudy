#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <functional>
#include <map>
#include <memory>
#include <optional>
#include <stdexcept>
#include "telemetry.hpp"

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

class FakeSentry : public SentryClient {
public:
    explicit FakeSentry(std::vector<std::string>& log) : log_(log) {}

    void captureMessage(const std::string& message, const std::map<std::string, std::string>& options) override {
        auto user = options.find("user.id");
        log_.push_back("sentry.captureMessage(" + message + ",level=" + options.at("level") +
                       (user != options.end() ? ",user.id=" + user->second : "") + ")");
    }

    std::string startSpan(const std::string& name, const std::function<std::string()>& fn) override {
        log_.push_back("sentry.startSpan(" + name + ")");
        return fn();
    }

    void close(int timeoutMs) override { log_.push_back("sentry.close(" + std::to_string(timeoutMs) + ")"); }

private:
    std::vector<std::string>& log_;
};

static std::string run(const std::string& text) {
    std::vector<std::string> log;
    std::unique_ptr<TelemetryRegistry> registry;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ', 3);
        if (parts[0] == "adapters") {
            std::vector<std::shared_ptr<TelemetryAdapter>> adapters;
            for (int i = 0; i < std::stoi(parts[1]); ++i)
                adapters.push_back(std::make_shared<SentryTelemetryAdapter>(std::make_shared<FakeSentry>(log)));
            registry = std::make_unique<TelemetryRegistry>(adapters);
        } else if (parts[0] == "msg") {
            registry->captureMessage(parts[2], parts[1] == "-" ? std::nullopt : std::optional<std::string>(parts[1]));
        } else if (parts[0] == "span") {
            std::string value = parts[2];
            try {
                log.push_back("result=" + registry->startSpan(parts[1], [&] {
                    if (value[0] == '!') throw std::runtime_error(value.substr(1));
                    return value;
                }));
            } catch (const std::runtime_error& e) {
                log.push_back(std::string("ERR:") + e.what());
            }
        } else if (parts[0] == "shutdown") {
            registry->shutdown();
        }
    }
    return join(log, "~");
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
