#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <optional>
#include <stdexcept>
#include "announcement_service.hpp"

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

class Events : public EventPublisher {
public:
    explicit Events(std::vector<std::string>& out) : out_(out) {}
    void publishMainStream(const std::string& userId, const std::string& type) override {
        out_.push_back("event:main:" + userId + " " + type);
    }
    void publishBroadcastStream(const std::string& type) override { out_.push_back("event:broadcast " + type); }

private:
    std::vector<std::string>& out_;
};

class ModLog : public ModerationLog {
public:
    explicit ModLog(std::vector<std::string>& out) : out_(out) {}
    void log(const std::string&, const std::string& type) override { out_.push_back("modlog:" + type); }

private:
    std::vector<std::string>& out_;
};

static std::string run(const std::string& text) {
    std::vector<std::string> out;
    Events events(out);
    ModLog moderationLog(out);
    AnnouncementRepository repo;
    AnnouncementService service(repo, events, moderationLog);
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ', 4);
        if (parts[0] == "create") {
            size_t start = out.size();
            std::optional<std::string> user = parts[1] == "-" ? std::nullopt : std::optional<std::string>(parts[1]);
            std::optional<std::string> mod = parts[2] == "mod" ? std::optional<std::string>("admin") : std::nullopt;
            Announcement created = service.create(parts[3], user, mod);
            out.insert(out.begin() + start, "created#" + std::to_string(created.id));
        } else if (parts[0] == "read") {
            int id = std::stoi(parts[2]);
            Announcement* target = repo.find(id);
            bool wasActive = target && target->isActive;
            service.read(parts[1], id);
            if (wasActive && !target->isActive) out.push_back("deactivated#" + std::to_string(id));
        } else if (parts[0] == "get") {
            try {
                std::optional<std::string> me = parts[2] == "-" ? std::nullopt : std::optional<std::string>(parts[2]);
                Packed packed = service.get(std::stoi(parts[1]), me);
                out.push_back("announcement#" + std::to_string(packed.announcement.id) + " title=" + packed.announcement.title +
                              (packed.read ? std::string(" read=") + (*packed.read ? "true" : "false") : ""));
            } catch (const std::runtime_error& e) {
                out.push_back(std::string("ERR:") + e.what());
            }
        } else if (parts[0] == "unread") {
            std::vector<std::string> ids;
            for (int id : service.unread(parts[1])) ids.push_back(std::to_string(id));
            out.push_back("unread:" + (ids.empty() ? std::string("none") : join(ids, ",")));
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
