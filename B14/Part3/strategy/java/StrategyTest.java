import java.util.List;

public class StrategyTest {
    private static int passed = 0;
    private static void check(boolean condition, String name) {
        if (!condition) throw new AssertionError("FAIL " + name);
        passed++;
        System.out.println("PASS " + name);
    }
    public static void main(String[] args) {
        LlmContext context = new LlmContext();
        check(context.stream("claude", "hello").equals(List.of("claude:", "hello")), "S01 Claude chunks");
        check(context.stream("openai", "hello").equals(List.of("openai:", "hello")), "S02 OpenAI chunks");
        check(context.stream("gemini", "summary").equals(List.of("gemini:", "summary")), "S03 Gemini chunks");
        boolean rejected = false;
        try { context.stream("unknown", "hello"); }
        catch (IllegalArgumentException e) { rejected = e.getMessage().equals("unsupported provider: unknown"); }
        check(rejected, "S04 unsupported provider");
        System.out.println("RESULT " + passed + "/4");
    }
}
