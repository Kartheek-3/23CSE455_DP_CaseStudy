// S3-N01: dependency-free Strategy collaboration; cents and percentages are integral.
interface FeeStrategy {
    int feeRate(long secondsUntilStart);
}
final class FlexiblePolicy implements FeeStrategy {
    public int feeRate(long secondsUntilStart) {
        if (secondsUntilStart >= 86400) return 0;
        if (secondsUntilStart > 0) return 10;
        return 100;
    }
}
final class ModeratePolicy implements FeeStrategy {
    public int feeRate(long secondsUntilStart) {
        if (secondsUntilStart >= 259200) return 0;
        if (secondsUntilStart >= 86400) return 50;
        return 100;
    }
}
final class StrictPolicy implements FeeStrategy {
    public int feeRate(long secondsUntilStart) { return 100; }
}
final class QuoteEvaluator {
    private final java.util.Map<String, FeeStrategy> policies = java.util.Map.of(
        "flexible", new FlexiblePolicy(),
        "moderate", new ModeratePolicy(),
        "strict", new StrictPolicy()
    );
    public String evaluate(String caseId, String policyCode, String timeRaw,
                           String amountRaw, String currency) {
        FeeStrategy strategy = policies.get(policyCode);
        if (strategy == null) return error(caseId, "UNKNOWN_POLICY");
        if (!timeRaw.matches("-?\\d+")) return error(caseId, "INVALID_TIME");
        long seconds;
        try { seconds = Long.parseLong(timeRaw); }
        catch (NumberFormatException e) { return error(caseId, "INVALID_TIME"); }
        if (!amountRaw.matches("-?\\d+")) return error(caseId, "INVALID_AMOUNT");
        long amount;
        try { amount = Long.parseLong(amountRaw); }
        catch (NumberFormatException e) { return error(caseId, "INVALID_AMOUNT"); }
        if (amount < 0) return error(caseId, "INVALID_AMOUNT");
        if (!currency.equals("EUR") && !currency.equals("GBP") && !currency.equals("USD"))
            return error(caseId, "UNSUPPORTED_CURRENCY");
        long fee;
        try { fee = Math.addExact(Math.multiplyExact(amount, strategy.feeRate(seconds)), 50) / 100; }
        catch (ArithmeticException e) { return error(caseId, "INVALID_AMOUNT"); }
        long refund = amount - fee;
        return String.join("\t", caseId, "OK", policyCode, Long.toString(fee),
                           Long.toString(refund), currency, refund > 0 ? "YES" : "NO");
    }
    private String error(String caseId, String reason) {
        return String.join("\t", caseId, "ERROR", reason);
    }
}
