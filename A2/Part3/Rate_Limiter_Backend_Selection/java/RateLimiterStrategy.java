interface RateLimiterStrategy {
    boolean isRateLimited(String userId);
}

class EtsRateLimiter implements RateLimiterStrategy {
    public boolean isRateLimited(String userId) {
        System.out.println("Checking limit using ETS-style storage");
        return false;
    }
}

class MemcacheRateLimiter implements RateLimiterStrategy {
    public boolean isRateLimited(String userId) {
        System.out.println("Checking limit using Memcache");
        return false;
    }
}

class RateLimiter {
    private final RateLimiterStrategy strategy;

    RateLimiter(RateLimiterStrategy strategy) {
        this.strategy = strategy;
    }

    boolean isRateLimited(String userId) {
        return strategy.isRateLimited(userId);
    }

    public static void main(String[] args) {
        RateLimiter limiter = new RateLimiter(new EtsRateLimiter());
        limiter.isRateLimited("user-1");
    }
}
