// S3-N01: Strategy selection and integral, half-up-cent computation.
#include "main.hpp"
#include <climits>
#include <regex>
#include <stdexcept>

int FlexiblePolicy::feeRate(long long secondsUntilStart) const {
    if (secondsUntilStart >= 86400) return 0;
    if (secondsUntilStart > 0) return 10;
    return 100;
}
int ModeratePolicy::feeRate(long long secondsUntilStart) const {
    if (secondsUntilStart >= 259200) return 0;
    if (secondsUntilStart >= 86400) return 50;
    return 100;
}
int StrictPolicy::feeRate(long long /* secondsUntilStart */) const {
    return 100;
}
static bool numeric(const std::string& text) {
    static const std::regex pattern("-?[0-9]+");
    return std::regex_match(text, pattern);
}
static std::string error(const std::string& id, const std::string& code) {
    return id + "\tERROR\t" + code;
}
std::string QuoteEvaluator::evaluate(const std::string& caseId, const std::string& policyCode,
                                     const std::string& timeRaw, const std::string& amountRaw,
                                     const std::string& currency) const {
    const FeeStrategy* policy = nullptr;
    if (policyCode == "flexible") policy = &flexible_;
    else if (policyCode == "moderate") policy = &moderate_;
    else if (policyCode == "strict") policy = &strict_;
    if (!policy) return error(caseId, "UNKNOWN_POLICY");
    if (!numeric(timeRaw)) return error(caseId, "INVALID_TIME");
    long long seconds;
    try { seconds = std::stoll(timeRaw); }
    catch (const std::exception&) { return error(caseId, "INVALID_TIME"); }
    if (!numeric(amountRaw)) return error(caseId, "INVALID_AMOUNT");
    long long amount;
    try { amount = std::stoll(amountRaw); }
    catch (const std::exception&) { return error(caseId, "INVALID_AMOUNT"); }
    if (amount < 0) return error(caseId, "INVALID_AMOUNT");
    if (currency != "EUR" && currency != "GBP" && currency != "USD")
        return error(caseId, "UNSUPPORTED_CURRENCY");
    int percentage = policy->feeRate(seconds);
    if (amount > (LLONG_MAX - 50) / 100) return error(caseId, "INVALID_AMOUNT");
    long long fee = (amount * percentage + 50) / 100;
    long long refund = amount - fee;
    return caseId + "\tOK\t" + policyCode + "\t" + std::to_string(fee) + "\t" +
           std::to_string(refund) + "\t" + currency + "\t" + (refund > 0 ? "YES" : "NO");
}
