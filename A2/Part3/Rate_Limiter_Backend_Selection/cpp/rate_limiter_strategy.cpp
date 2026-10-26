#include <iostream>
#include <memory>
#include <string>
using namespace std;

class RateLimiterStrategy {
public:
    virtual bool isRateLimited(const string& userId) = 0;
    virtual ~RateLimiterStrategy() = default;
};

class EtsRateLimiter : public RateLimiterStrategy {
public:
    bool isRateLimited(const string& userId) override {
        cout << "Checking limit using ETS-style storage for " << userId << endl;
        return false;
    }
};

class MemcacheRateLimiter : public RateLimiterStrategy {
public:
    bool isRateLimited(const string& userId) override {
        cout << "Checking limit using Memcache for " << userId << endl;
        return false;
    }
};

class RateLimiter {
private:
    unique_ptr<RateLimiterStrategy> strategy;

public:
    explicit RateLimiter(unique_ptr<RateLimiterStrategy> s)
        : strategy(move(s)) {}

    bool isRateLimited(const string& userId) {
        return strategy->isRateLimited(userId);
    }
};

int main() {
    RateLimiter limiter(make_unique<EtsRateLimiter>());
    cout << limiter.isRateLimited("user-1") << endl;
    return 0;
}
