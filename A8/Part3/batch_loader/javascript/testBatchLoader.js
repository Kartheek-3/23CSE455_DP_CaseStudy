const {
    BatchLoader,
    UserRepository,
    createUserBatchFn
} = require("./batchLoader");

let passed = 0;
let failed = 0;

function check(testName, expected, actual) {
    if (expected === actual) {
        console.log(`PASS: ${testName}`);
        passed++;
    } else {
        console.log(`FAIL: ${testName} | expected=${expected} | actual=${actual}`);
        failed++;
    }
}

function nameOf(ticket) {
    return ticket.value === null ? "null" : ticket.value.name;
}

function main() {
    const repo = new UserRepository([
        { id: "u1", name: "Alice" },
        { id: "u2", name: "Bob" },
        { id: "u3", name: "Carol" }
    ]);
    const loader = new BatchLoader(createUserBatchFn(repo));

    const first = loader.load("u2");
    const second = loader.load("u1");
    const duplicate = loader.load("u2");
    const missing = loader.load("u9");
    loader.dispatch();

    check("Four load requests trigger one repository query", "1", String(repo.queries.length));
    check("Repository receives unique keys in first-seen order", "u2,u1,u9", repo.queries[0]);
    check("u2 resolves to Bob", "Bob", nameOf(first));
    check("u1 resolves to Alice", "Alice", nameOf(second));
    check("Duplicate u2 request resolves to Bob", "Bob", nameOf(duplicate));
    check("Missing u9 resolves to null", "null", nameOf(missing));

    const cached = loader.load("u2");
    loader.dispatch();
    check("Repeated u2 load is served from cache without a new query", "1:Bob", `${repo.queries.length}:${nameOf(cached)}`);

    console.log();
    console.log(`RESULT: ${passed} passed, ${failed} failed`);

    return failed > 0 ? 1 : 0;
}

process.exit(main());
