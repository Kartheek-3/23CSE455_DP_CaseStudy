from abc import ABC, abstractmethod


class RateLimiterStrategy(ABC):
    @abstractmethod
    def is_rate_limited(self, user_id: str) -> bool:
        pass


class EtsRateLimiter(RateLimiterStrategy):
    def is_rate_limited(self, user_id: str) -> bool:
        print(f"Checking limit using ETS-style storage for {user_id}")
        return False


class MemcacheRateLimiter(RateLimiterStrategy):
    def is_rate_limited(self, user_id: str) -> bool:
        print(f"Checking limit using Memcache for {user_id}")
        return False


class RateLimiter:
    def __init__(self, strategy: RateLimiterStrategy):
        self.strategy = strategy

    def is_rate_limited(self, user_id: str) -> bool:
        return self.strategy.is_rate_limited(user_id)


if __name__ == "__main__":
    limiter = RateLimiter(EtsRateLimiter())
    print(limiter.is_rate_limited("user-1"))
