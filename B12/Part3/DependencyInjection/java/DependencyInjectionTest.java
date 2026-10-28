// Tests for the Dependency Injection cross-language snippet (shared cases).

public class DependencyInjectionTest {
    private static int passed = 0;
    private static int total = 0;

    private static void check(String label, Object actual, Object expected) {
        total += 1;
        if (!actual.equals(expected)) {
            throw new AssertionError(
                label + ": expected " + expected + " got " + actual);
        }
        passed += 1;
    }

    public static void main(String[] args) {
        EmailSender email = new EmailSender();
        check("email-channel", email.channel(), "email");

        NotificationService emailService = new NotificationService(email);
        check("email-send", emailService.notifyUser("hi"), "email:hi");

        SmsSender sms = new SmsSender();
        check("sms-channel", sms.channel(), "sms");

        NotificationService smsService = new NotificationService(sms);
        check("sms-send", smsService.notifyUser("hi"), "sms:hi");

        check("inject-different",
            emailService.notifyUser("x").equals(smsService.notifyUser("x")) ? 0 : 1, 1);
        check("composition-root",
            NotificationService.build().notifyUser("p"), "email:p");

        System.out.println("DEPENDENCY_INJECTION_JAVA PASS " + passed + "/" + total);
    }
}
