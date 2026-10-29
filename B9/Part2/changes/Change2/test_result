# Test Result - CH02 Transaction Limits

## Test Specifications
- **Test Class**: `com.b9.wallet.DigitalWalletRulesTest`
- **Test Method**: `enforcesPerTransferAndDailyLimits()`
- **Source File**: `Part2/code/digital-wallet/src/test/java/com/b9/wallet/DigitalWalletRulesTest.java:28-36`

## Acceptance Test Assertions
1. **Transfer within Limit**:
   - Limit: Per-transfer cap EUR 1,000.00, Daily cap EUR 1,000.00.
   - Input: Transfer `EUR 900.00` with prior daily usage `EUR 0.00`.
   - Expected Result: Passes validation without exception.
   - Verification: `assertDoesNotThrow(() -> limits.validate(transfer("b1", "900.00"), new BigDecimal("0.00")))`
2. **Transfer Exceeding Per-Transfer Cap**:
   - Input: Transfer `EUR 1,001.00`.
   - Expected Result: `IllegalArgumentException` thrown.
   - Verification: `assertThrows(IllegalArgumentException.class, () -> limits.validate(transfer("b1", "1001.00"), BigDecimal.ZERO))`
3. **Transfer Exceeding Accumulated Daily Cap**:
   - Input: Transfer `EUR 300.00` when prior daily total is already `EUR 800.00` (sum = EUR 1,100 > EUR 1,000).
   - Expected Result: `IllegalArgumentException` thrown by `DailyLimitDecorator`.
   - Verification: `assertThrows(IllegalArgumentException.class, () -> limits.validate(transfer("b1", "300.00"), new BigDecimal("800.00")))`

## Execution Status
- Environment status: `not_run: no JDK / Maven available in execution environment`.
- When compiled on JDK 17+ with `mvn test`, this unit test validates Decorator pattern composition over core per-transfer limits.
