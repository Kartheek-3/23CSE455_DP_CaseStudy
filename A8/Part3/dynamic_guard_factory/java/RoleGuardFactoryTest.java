public class RoleGuardFactoryTest {

    private static int passed = 0;
    private static int failed = 0;

    private static void check(
            String testName,
            boolean expected,
            boolean actual) {

        if (expected == actual) {
            System.out.println("PASS: " + testName);
            passed++;
        } else {
            System.out.println(
                "FAIL: " + testName
                + " | expected=" + expected
                + " | actual=" + actual
            );
            failed++;
        }
    }

    public static void main(String[] args) {

        RoleGuardFactory.Guard adminCrewGuard =
                RoleGuardFactory.createGuard("ADMIN", "CREW");

        check(
                "ADMIN is authorized",
                true,
                adminCrewGuard.isAuthorized("ADMIN")
        );

        check(
                "CREW is authorized",
                true,
                adminCrewGuard.isAuthorized("CREW")
        );

        check(
                "USER is unauthorized",
                false,
                adminCrewGuard.isAuthorized("USER")
        );

        check(
                "SECURITY is unauthorized",
                false,
                adminCrewGuard.isAuthorized("SECURITY")
        );

        RoleGuardFactory.Guard emptyGuard =
                RoleGuardFactory.createGuard();

        check(
                "Empty allowed roles reject ADMIN",
                false,
                emptyGuard.isAuthorized("ADMIN")
        );

        RoleGuardFactory.Guard userGuard =
                RoleGuardFactory.createGuard("USER");

        check(
                "USER is authorized",
                true,
                userGuard.isAuthorized("USER")
        );

        check(
                "Missing user role is unauthorized",
                false,
                userGuard.isAuthorized(null)
        );

        System.out.println();
        System.out.println(
                "RESULT: " + passed + " passed, "
                + failed + " failed"
        );

        if (failed > 0) {
            System.exit(1);
        }
    }
}