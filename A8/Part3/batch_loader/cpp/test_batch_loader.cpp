#include <iostream>
#include <string>

#include "batch_loader.cpp"

int passed = 0;
int failed = 0;

void check(
    const std::string& testName,
    const std::string& expected,
    const std::string& actual
) {
    if (expected == actual) {
        std::cout << "PASS: " << testName << std::endl;
        passed++;
    } else {
        std::cout << "FAIL: " << testName
                  << " | expected=" << expected
                  << " | actual=" << actual << std::endl;
        failed++;
    }
}

std::string nameOf(const std::shared_ptr<Ticket<User>>& ticket) {
    return ticket->value ? ticket->value->name : "null";
}

int main() {
    UserRepository repo({
        {"u1", "Alice"},
        {"u2", "Bob"},
        {"u3", "Carol"}
    });
    BatchLoader<User> loader(createUserBatchFn(repo));

    auto first = loader.load("u2");
    auto second = loader.load("u1");
    auto duplicate = loader.load("u2");
    auto missing = loader.load("u9");
    loader.dispatch();

    check("Four load requests trigger one repository query", "1", std::to_string(repo.queries.size()));
    check("Repository receives unique keys in first-seen order", "u2,u1,u9", repo.queries[0]);
    check("u2 resolves to Bob", "Bob", nameOf(first));
    check("u1 resolves to Alice", "Alice", nameOf(second));
    check("Duplicate u2 request resolves to Bob", "Bob", nameOf(duplicate));
    check("Missing u9 resolves to null", "null", nameOf(missing));

    auto cached = loader.load("u2");
    loader.dispatch();
    check("Repeated u2 load is served from cache without a new query", "1:Bob", std::to_string(repo.queries.size()) + ":" + nameOf(cached));

    std::cout << std::endl;
    std::cout << "RESULT: " << passed << " passed, " << failed << " failed" << std::endl;

    return failed > 0 ? 1 : 0;
}
