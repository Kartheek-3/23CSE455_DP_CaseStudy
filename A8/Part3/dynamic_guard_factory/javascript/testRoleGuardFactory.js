const { createGuard } = require("./roleGuardFactory");

let passed = 0;
let failed = 0;

function check(testName, expected, actual) {
    if (expected === actual) {
        console.log(`PASS: ${testName}`);
        passed++;
    } else {
        console.log(
            `FAIL: ${testName} | expected=${expected} | actual=${actual}`
        );
        failed++;
    }
}

function main() {
    const adminCrewGuard = createGuard("ADMIN", "CREW");

    check(
        "ADMIN is authorized",
        true,
        adminCrewGuard("ADMIN")
    );

    check(
        "CREW is authorized",
        true,
        adminCrewGuard("CREW")
    );

    check(
        "USER is unauthorized",
        false,
        adminCrewGuard("USER")
    );

    check(
        "SECURITY is unauthorized",
        false,
        adminCrewGuard("SECURITY")
    );

    const emptyGuard = createGuard();

    check(
        "Empty allowed roles reject ADMIN",
        false,
        emptyGuard("ADMIN")
    );

    const userGuard = createGuard("USER");

    check(
        "USER is authorized",
        true,
        userGuard("USER")
    );

    check(
        "Missing user role is unauthorized",
        false,
        userGuard(null)
    );

    console.log();
    console.log(`RESULT: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
        process.exit(1);
    }
}

main();