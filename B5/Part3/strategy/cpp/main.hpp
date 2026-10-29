#pragma once
#include <string>

struct FeeStrategy {
    virtual ~FeeStrategy() = default;
    virtual int feeRate(long long secondsUntilStart) const = 0;
};
struct FlexiblePolicy final : FeeStrategy {
    int feeRate(long long secondsUntilStart) const override;
};
struct ModeratePolicy final : FeeStrategy {
    int feeRate(long long secondsUntilStart) const override;
};
struct StrictPolicy final : FeeStrategy {
    int feeRate(long long secondsUntilStart) const override;
};
class QuoteEvaluator {
    FlexiblePolicy flexible_;
    ModeratePolicy moderate_;
    StrictPolicy strict_;
public:
    std::string evaluate(const std::string& caseId, const std::string& policyCode,
                         const std::string& timeRaw, const std::string& amountRaw,
                         const std::string& currency) const;
};
