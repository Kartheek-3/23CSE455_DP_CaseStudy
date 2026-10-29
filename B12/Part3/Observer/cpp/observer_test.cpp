#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>

#include "occupancy_observer.hpp"

static int g_passed = 0;
static int g_total = 0;

static void check(const std::string& label, long long actual, long long expected) {
    ++g_total;
    if (actual != expected) {
        std::cerr << label << ": expected " << expected << " got " << actual << "\n";
        std::abort();
    }
    ++g_passed;
}

static std::string join(const std::vector<std::string>& items) {
    std::string out;
    for (std::size_t i = 0; i < items.size(); ++i) {
        if (i > 0) {
            out += ",";
        }
        out += items[i];
    }
    return out;
}

int main() {
    AvailabilityObserver avail;
    LoggingObserver log;
    OccupancyMonitor monitor;
    monitor.attach(&avail);
    monitor.attach(&log);

    check("notify-return", static_cast<long long>(monitor.notify("occupy:1")), 2);
    check("avail-1", static_cast<long long>(avail.count()), 1);
    check("log-1", static_cast<long long>(log.events().size()), 1);

    monitor.notify("occupy:2");
    check("avail-2", static_cast<long long>(avail.count()), 2);

    monitor.notify("free:1");
    check("avail-free", static_cast<long long>(avail.count()), 1);

    monitor.detach(&log);
    monitor.notify("occupy:3");
    check("avail-3", static_cast<long long>(avail.count()), 2);
    check("log-still-3", static_cast<long long>(log.events().size()), 3);
    check("log-contents", join(log.events()) == "occupy:1,occupy:2,free:1" ? 1 : 0, 1);

    std::cout << "OBSERVER_CPP PASS " << g_passed << "/" << g_total << "\n";
    return 0;
}
