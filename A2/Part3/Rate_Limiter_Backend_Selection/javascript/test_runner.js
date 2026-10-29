const assert = require("node:assert/strict");
const { RateLimiter, EtsRateLimiter } = require("./rate_limiter_strategy");

const limiter = new RateLimiter(new EtsRateLimiter());
assert.equal(limiter.isRateLimited("user-1"), false);
console.log("PASS: Rate limiter strategy delegation (placeholder behavior)");
