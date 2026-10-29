# Test Result - CH01 Multi-Currency Support

## Test Specifications
- **Test Class**: `com.b9.wallet.DigitalWalletRulesTest`
- **Test Method**: `convertsOnlyTheConfiguredDemoPair()`
- **Source File**: `Part2/code/digital-wallet/src/test/java/com/b9/wallet/DigitalWalletRulesTest.java:18-26`

## Acceptance Test Assertions
1. **Configured Pair Conversion**:
   - Input: `USD 10.00` to `EUR` with exchange rate `0.92`.
   - Expected Result: `EUR 9.2000`.
   - Verification: `assertEquals(new BigDecimal("9.2000"), factory.create("USD", "EUR").convert(...).amount())`
2. **Same-Currency Conversion**:
   - Input: `EUR 10.00` to `EUR`.
   - Expected Result: `EUR 10.00` (unchanged pass-through).
   - Verification: `assertEquals(new BigDecimal("10.00"), factory.create("EUR", "EUR").convert(...).amount())`
3. **Unsupported Pair Rejection**:
   - Input: `GBP` to `EUR`.
   - Expected Result: `IllegalArgumentException` thrown.
   - Verification: `assertThrows(IllegalArgumentException.class, () -> fx.quote("GBP", "EUR"))`

## Execution Status
- Environment status: `not_run: no JDK / Maven available in execution environment`.
- When compiled on JDK 17+ with `mvn test`, this unit test confirms isolated currency strategy selection and adapter quote lookup.
