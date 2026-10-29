public class TestRunner {
    public static void main(String[] args) {
        StateServer server = new StateServer(new AlertParser());
        String result = server.process("sample-data");
        if (!result.equals("Parsed alert: sample-data")) {
            throw new AssertionError("Unexpected parser result: " + result);
        }
        System.out.println("PASS: Alert parser strategy delegation");
    }
}

