from role_guard_factory import create_guard


passed = 0
failed = 0


def check(test_name: str, expected: bool, actual: bool) -> None:
    global passed, failed

    if expected == actual:
        print(f"PASS: {test_name}")
        passed += 1
    else:
        print(
            f"FAIL: {test_name} | "
            f"expected={expected} | actual={actual}"
        )
        failed += 1


def main() -> None:
    admin_crew_guard = create_guard("ADMIN", "CREW")

    check(
        "ADMIN is authorized",
        True,
        admin_crew_guard("ADMIN"),
    )

    check(
        "CREW is authorized",
        True,
        admin_crew_guard("CREW"),
    )

    check(
        "USER is unauthorized",
        False,
        admin_crew_guard("USER"),
    )

    check(
        "SECURITY is unauthorized",
        False,
        admin_crew_guard("SECURITY"),
    )

    empty_guard = create_guard()

    check(
        "Empty allowed roles reject ADMIN",
        False,
        empty_guard("ADMIN"),
    )

    user_guard = create_guard("USER")

    check(
        "USER is authorized",
        True,
        user_guard("USER"),
    )

    check(
        "Missing user role is unauthorized",
        False,
        user_guard(None),
    )

    print()
    print(f"RESULT: {passed} passed, {failed} failed")

    if failed > 0:
        raise SystemExit(1)


if __name__ == "__main__":
    main()