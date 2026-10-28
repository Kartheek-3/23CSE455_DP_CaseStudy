'use strict';
// S3-N01: Strategy. All monetary arithmetic is BigInt integer-cents.
class FlexiblePolicy {
  feeRate(secondsUntilStart) {
    if (secondsUntilStart >= 86400n) return 0n;
    if (secondsUntilStart > 0n) return 10n;
    return 100n;
  }
}
class ModeratePolicy {
  feeRate(secondsUntilStart) {
    if (secondsUntilStart >= 259200n) return 0n;
    if (secondsUntilStart >= 86400n) return 50n;
    return 100n;
  }
}
class StrictPolicy {
  feeRate(secondsUntilStart) { return 100n; }
}
class QuoteEvaluator {
  constructor() {
    this.policies = Object.freeze({
      flexible: new FlexiblePolicy(),
      moderate: new ModeratePolicy(),
      strict: new StrictPolicy()
    });
  }
  evaluate(caseId, policyCode, timeRaw, amountRaw, currency) {
    const strategy = Object.hasOwn(this.policies, policyCode) ? this.policies[policyCode] : null;
    if (!strategy) return `${caseId}\tERROR\tUNKNOWN_POLICY`;
    if (!/^-?\d+$/.test(timeRaw)) return `${caseId}\tERROR\tINVALID_TIME`;
    if (!/^-?\d+$/.test(amountRaw)) return `${caseId}\tERROR\tINVALID_AMOUNT`;
    const seconds = BigInt(timeRaw);
    const amount = BigInt(amountRaw);
    if (amount < 0n) return `${caseId}\tERROR\tINVALID_AMOUNT`;
    if (!['EUR', 'GBP', 'USD'].includes(currency)) return `${caseId}\tERROR\tUNSUPPORTED_CURRENCY`;
    const fee = (amount * strategy.feeRate(seconds) + 50n) / 100n;
    const refund = amount - fee;
    const refundable = refund > 0n ? 'YES' : 'NO';
    return `${caseId}\tOK\t${policyCode}\t${fee}\t${refund}\t${currency}\t${refundable}`;
  }
}
module.exports = { FlexiblePolicy, ModeratePolicy, StrictPolicy, QuoteEvaluator };
