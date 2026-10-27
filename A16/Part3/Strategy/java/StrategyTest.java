public class StrategyTest {
    public static void main(String[] args) {
        int[] actual = StrategyExample.results();
        if (actual[0] != 9000 || actual[1] != 8000) {
            throw new AssertionError("Expected 9000 and 8000 cents");
        }
        System.out.println("Strategy tests passed: 2/2");
    }
}
