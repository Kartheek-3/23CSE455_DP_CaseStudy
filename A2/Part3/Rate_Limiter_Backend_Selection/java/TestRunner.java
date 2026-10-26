public class TestRunner {
    public static void main(String[] args) {
        RateLimiter limiter = new RateLimiter(new EtsRateLimiter());
        boolean result = limiter.isRateLimited("user-1");
        if (result) throw new AssertionError("Expected false placeholder");
        System.out.println("PASS: Rate limiter strategy delegation");
    }
}
