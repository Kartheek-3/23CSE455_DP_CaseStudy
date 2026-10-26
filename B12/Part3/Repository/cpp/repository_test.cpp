// Tests for the Repository cross-language snippet (shared cases).

#include "user_repository.hpp"

#include <cstdlib>
#include <iostream>

static int passed = 0;
static int total = 0;

static void check(const char* label, long long actual, long long expected) {
    total += 1;
    if (actual != expected) {
        std::cerr << label << ": expected " << expected
                  << " got " << actual << "\n";
        std::exit(1);
    }
    passed += 1;
}

int main() {
    InMemoryUserRepository repo;
    UserService service(&repo);

    service.registerUser(User(1, "Ada"));
    check("find-name", service.get(1)->name == "Ada" ? 1 : 0, 1);
    check("all-1", static_cast<long long>(service.all().size()), 1);

    service.registerUser(User(2, "Bob"));
    check("all-2", static_cast<long long>(service.all().size()), 2);

    check("missing", service.get(99) == nullptr ? 1 : 0, 1);

    service.registerUser(User(1, "Ada2"));
    check("overwrite-count", static_cast<long long>(service.all().size()), 2);
    check("overwrite-name", service.get(1)->name == "Ada2" ? 1 : 0, 1);

    service.remove(1);
    check("deleted", service.get(1) == nullptr ? 1 : 0, 1);
    check("all-after-delete", static_cast<long long>(service.all().size()), 1);

    std::cout << "REPOSITORY_CPP PASS " << passed << "/" << total << "\n";
    return 0;
}
