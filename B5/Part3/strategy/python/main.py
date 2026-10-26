"""S3-N01: deterministic Strategy collaboration; no booking side effects."""
import re
from abc import ABC, abstractmethod


class FeeStrategy(ABC):
    @abstractmethod
    def feeRate(self, secondsUntilStart: int) -> int:
        """Return a fee percentage in the range [0, 100]."""


class FlexiblePolicy(FeeStrategy):
    def feeRate(self, secondsUntilStart: int) -> int:
        if secondsUntilStart >= 86400:
            return 0
        if secondsUntilStart > 0:
            return 10
        return 100


class ModeratePolicy(FeeStrategy):
    def feeRate(self, secondsUntilStart: int) -> int:
        if secondsUntilStart >= 259200:
            return 0
        if secondsUntilStart >= 86400:
            return 50
        return 100


class StrictPolicy(FeeStrategy):
    def feeRate(self, secondsUntilStart: int) -> int:
        return 100


class QuoteError(Exception):
    pass


class QuoteEvaluator:
    def __init__(self):
        self.policies = {
            "flexible": FlexiblePolicy(),
            "moderate": ModeratePolicy(),
            "strict": StrictPolicy(),
        }

    def evaluate(self, caseId: str, policyCode: str, timeRaw: str,
                 amountRaw: str, currency: str) -> str:
        try:
            strategy = self.policies.get(policyCode)
            if strategy is None:
                raise QuoteError("UNKNOWN_POLICY")
            if not re.fullmatch(r"-?\d+", timeRaw):
                raise QuoteError("INVALID_TIME")
            seconds = int(timeRaw)
            if not re.fullmatch(r"-?\d+", amountRaw):
                raise QuoteError("INVALID_AMOUNT")
            amount = int(amountRaw)
            if amount < 0:
                raise QuoteError("INVALID_AMOUNT")
            if currency not in ("EUR", "GBP", "USD"):
                raise QuoteError("UNSUPPORTED_CURRENCY")
            rate = strategy.feeRate(seconds)
            fee = (amount * rate + 50) // 100
            refund = amount - fee
            refundable = "YES" if refund > 0 else "NO"
            return f"{caseId}\tOK\t{policyCode}\t{fee}\t{refund}\t{currency}\t{refundable}"
        except QuoteError as exc:
            return f"{caseId}\tERROR\t{exc}"
