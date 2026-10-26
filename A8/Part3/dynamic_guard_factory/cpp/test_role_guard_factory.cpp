#include <iostream>
#include <string>

#include "role_guard_factory.cpp"

int passed = 0;
int failed = 0;

void check(
    const std::string& testName,
    bool expected,
    bool actual
) {
    if (expected == actual) {
        std::cout << "PASS: " << testName << '\n';
        passed++;
    } else {
        std::cout
            << "FAIL: " << testName
            << " | expected=" << std::boolalpha << expected
            << " | actual=" << actual
            << '\n';
        failed++;
    }
}

int main() {
    Guard adminCrewGuard = createGuard({"ADMIN", "CREW"});

    std::string admin = "ADMIN";
    std::string crew = "CREW";
    std::string user = "USER";
    std::string security = "SECURITY";

    check(
        "ADMIN is authorized",
        true,
        adminCrewGuard(&admin)
    );

    check(
        "CREW is authorized",
        true,
        adminCrewGuard(&crew)
    );

    check(
        "USER is unauthorized",
        false,
        adminCrewGuard(&user)
    );

    check(
        "SECURITY is unauthorized",
        false,
        adminCrewGuard(&security)
    );

    Guard emptyGuard = createGuard({});

    check(
        "Empty allowed roles reject ADMIN",
        false,
        emptyGuard(&admin)
    );

    Guard userGuard = createGuard({"USER"});

    check(
        "USER is authorized",
        true,
        userGuard(&user)
    );

    check(
        "Missing user role is unauthorized",
        false,
        userGuard(nullptr)
    );

    std::cout << '\n';
    std::cout
        << "RESULT: "
        << passed
        << " passed, "
        << failed
        << " failed"
        << '\n';

    return failed > 0 ? 1 : 0;
}