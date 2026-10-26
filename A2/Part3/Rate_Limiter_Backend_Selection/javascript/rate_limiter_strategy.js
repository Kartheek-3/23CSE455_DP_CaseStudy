class EtsRateLimiter {
    isRateLimited(userId) {
        console.log(`Checking limit using ETS-style storage for ${userId}`);
        return false;
    }
}

class MemcacheRateLimiter {
    isRateLimited(userId) {
        console.log(`Checking limit using Memcache for ${userId}`);
        return false;
    }
}

class RateLimiter {
    constructor(strategy) {
        this.strategy = strategy;
    }

    isRateLimited(userId) {
        return this.strategy.isRateLimited(userId);
    }
}

module.exports = {
    EtsRateLimiter,
    MemcacheRateLimiter,
    RateLimiter
};
