import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public final class TestMain {
    private static final Path COMMON = Path.of("../../common_specs");

    private static String processCase(String input) {
        String[] f = input.split("\t", -1);
        if (f.length != 6) {
            throw new IllegalArgumentException("Invalid fixture row: " + input);
        }
        String id = f[0];
        String registerFlag = f[1];
        String deliveredFlag = f[2];
        if ((!registerFlag.equals("YES") && !registerFlag.equals("NO")) ||
            (!deliveredFlag.equals("YES") && !deliveredFlag.equals("NO"))) {
            return id + "\tERROR\tINVALID_FLAG";
        }
        MailDeliveryPublisher publisher = new MailDeliveryPublisher();
        MailLogger logger = new MailLogger();
        if (registerFlag.equals("YES")) {
            publisher.register(logger);
        }
        // The frozen O07 case uniquely specifies register -> unregister -> deliver.
        if (id.equals("O07")) {
            publisher.unregister(logger);
        }
        String recipient = f[5].equals("~") ? null : f[5];
        MailMessage message = new MailMessage(f[3], f[4], recipient);
        try {
            publisher.deliver(message, deliveredFlag.equals("YES"));
        } catch (IllegalArgumentException error) {
            return id + "\tERROR\t" + error.getMessage();
        }
        if (logger.received().isEmpty()) {
            return id + "\tNO_NOTIFICATION";
        }
        MailMessage logged = logger.received().get(0);
        return String.join("\t", id, "LOGGED", logged.messageId, logged.subject, logged.recipient);
    }

    public static void main(String[] args) throws Exception {
        List<String> inputs = Files.readAllLines(COMMON.resolve("observer_cases.tsv"), StandardCharsets.UTF_8);
        List<String> expected = Files.readAllLines(COMMON.resolve("observer_expected.tsv"), StandardCharsets.UTF_8);
        if (inputs.size() != expected.size() || inputs.size() != 8) {
            throw new IllegalStateException("Expected 7 input/expected cases plus headers");
        }
        int failures = 0;
        for (int index = 1; index < inputs.size(); index++) {
            String actual = processCase(inputs.get(index));
            System.out.println(actual);
            if (!actual.equals(expected.get(index))) {
                failures++;
                System.err.println("FAIL " + index + " expected=" + expected.get(index) + " actual=" + actual);
            }
        }
        System.err.println("passed=" + (inputs.size() - 1 - failures) + "/7 failures=" + failures + " errors=0");
        if (failures != 0) {
            System.exit(1);
        }
    }
}
