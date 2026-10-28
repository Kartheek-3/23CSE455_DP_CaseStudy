// Runs fixtures O1-O6 from Part3/test-cases/observer_spec.md.
#include <functional>
#include <iostream>
#include <memory>
#include <string>
#include <utility>
#include <vector>
#include "ride_notification.hpp"

using Obs = std::shared_ptr<RecordingObserver>;
static Obs make() { return std::make_shared<RecordingObserver>(); }

int main() {
    const std::vector<std::pair<std::string, std::function<bool()>>> cases = {
        {"O1", [] {
             NotificationHub hub;
             Obs d1 = make(), d2 = make();
             hub.subscribe("d1", d1);
             hub.subscribe("d2", d2);
             int n = hub.broadcast({"d1", "d2", "d3"}, {"booking:new", "B1"});
             return n == 2 && d1->received.size() == 1 && d2->received.size() == 1;
         }},
        {"O2", [] {
             NotificationHub hub;
             Obs d1 = make(), d2 = make();
             hub.subscribe("d1", d1);
             hub.subscribe("d2", d2);
             hub.unsubscribe("d1");
             int n = hub.broadcast({"d1", "d2"}, {"booking:new", "B2"});
             return n == 1 && d1->received.empty();
         }},
        {"O3", [] {
             NotificationHub hub;
             return !hub.notify("r1", {"booking:confirmation", "B3"});
         }},
        {"O4", [] {
             NotificationHub hub;
             Obs a = make(), b = make();
             hub.subscribe("d1", a);
             hub.subscribe("d1", b);
             bool ok = hub.notify("d1", {"cancel:booking", "B4"});
             return ok && a->received.empty() && b->received.size() == 1;
         }},
        {"O5", [] {
             NotificationHub hub;
             Obs d2 = make();
             hub.subscribe("d2", d2);
             hub.notify("d2", {"booking:new", "B5"});
             hub.notify("d2", {"cancel:booking", "B5"});
             return d2->received.size() == 2 && d2->received[0].type == "booking:new" &&
                    d2->received[1].type == "cancel:booking";
         }},
        {"O6", [] {
             NotificationHub hub;
             Obs r1 = make();
             hub.subscribe("r1", r1);
             bool ok = hub.notify("r1", {"booking:confirmation", "B6"});
             return ok && hub.broadcast({}, {"booking:new", "B7"}) == 0;
         }},
    };
    int passed = 0;
    for (const auto& [id, body] : cases) {
        if (body()) {
            ++passed;
            std::cout << "PASS " << id << "\n";
        } else {
            std::cout << "FAIL " << id << "\n";
        }
    }
    std::cout << "RESULT " << passed << "/" << cases.size() << " passed\n";
    return passed == static_cast<int>(cases.size()) ? 0 : 1;
}
