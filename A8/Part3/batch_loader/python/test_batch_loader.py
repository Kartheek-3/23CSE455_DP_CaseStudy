from batch_loader import BatchLoader, UserRepository, create_user_batch_fn

passed = 0
failed = 0


def check(test_name, expected, actual):
    global passed, failed

    if expected == actual:
        print(f"PASS: {test_name}")
        passed += 1
    else:
        print(f"FAIL: {test_name} | expected={expected} | actual={actual}")
        failed += 1


def name_of(ticket):
    return "null" if ticket.value is None else ticket.value["name"]


def main():
    repo = UserRepository([
        {"id": "u1", "name": "Alice"},
        {"id": "u2", "name": "Bob"},
        {"id": "u3", "name": "Carol"},
    ])
    loader = BatchLoader(create_user_batch_fn(repo))

    first = loader.load("u2")
    second = loader.load("u1")
    duplicate = loader.load("u2")
    missing = loader.load("u9")
    loader.dispatch()

    check("Four load requests trigger one repository query", "1", str(len(repo.queries)))
    check("Repository receives unique keys in first-seen order", "u2,u1,u9", repo.queries[0])
    check("u2 resolves to Bob", "Bob", name_of(first))
    check("u1 resolves to Alice", "Alice", name_of(second))
    check("Duplicate u2 request resolves to Bob", "Bob", name_of(duplicate))
    check("Missing u9 resolves to null", "null", name_of(missing))

    cached = loader.load("u2")
    loader.dispatch()
    check("Repeated u2 load is served from cache without a new query", "1:Bob", f"{len(repo.queries)}:{name_of(cached)}")

    print()
    print(f"RESULT: {passed} passed, {failed} failed")

    return 1 if failed > 0 else 0


if __name__ == "__main__":
    raise SystemExit(main())
