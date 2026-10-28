#include "observer.hpp"
#include <iostream>
#include <stdexcept>
#include <string>
static int passed = 0;
static void check(bool condition, const std::string& name) {
    if (!condition) throw std::runtime_error("FAIL " + name);
    ++passed;
    std::cout << "PASS " << name << '\n';
}
int main() {
    AuthEventSource source;
    RecordingAuthListener a("observer-A");
    source.subscribe(&a);
    source.publish("signed_in", "session-1");
    check(a.received().size() == 1 && a.received()[0] == "observer-A receives signed_in:session-1", "O01 sign-in delivered");
    source.publish("signed_out", "none");
    check(a.received().size() == 2 && a.received()[1] == "observer-A receives signed_out:none", "O02 sign-out delivered");
    source.unsubscribe(&a);
    const auto before = a.received().size();
    source.publish("signed_in", "session-2");
    check(a.received().size() == before, "O03 unsubscribe stops notifications");
    RecordingAuthListener b("observer-B");
    source.subscribe(&a); source.subscribe(&b);
    source.publish("signed_in", "session-3");
    check(a.received().back() == "observer-A receives signed_in:session-3"
        && b.received().size() == 1
        && b.received()[0] == "observer-B receives signed_in:session-3", "O04 multiple observers notified");
    std::cout << "RESULT " << passed << "/4\n";
    return 0;
}
