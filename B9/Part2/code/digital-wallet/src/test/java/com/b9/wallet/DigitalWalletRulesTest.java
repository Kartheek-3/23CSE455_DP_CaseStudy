package com.b9.wallet;

import com.b9.wallet.DigitalWalletApplication.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class DigitalWalletRulesTest {
    private Transfer transfer(String beneficiary, String amount) {
        return new Transfer("t1", "sender", beneficiary,
            new Money(new BigDecimal(amount), "EUR"), "PENDING", LocalDate.now());
    }

    @Test void convertsOnlyTheConfiguredDemoPair() {
        var fx = new VendorFxAdapter(new VendorFxClient());
        var factory = new CurrencyStrategyFactory(fx);
        assertEquals(new BigDecimal("9.2000"), factory.create("USD", "EUR")
            .convert(new Money(new BigDecimal("10.00"), "USD"), "EUR").amount());
        assertEquals(new BigDecimal("10.00"), factory.create("EUR", "EUR")
            .convert(new Money(new BigDecimal("10.00"), "EUR"), "EUR").amount());
        assertThrows(IllegalArgumentException.class, () -> fx.quote("GBP", "EUR"));
    }

    @Test void enforcesPerTransferAndDailyLimits() {
        var limits = new DailyLimitDecorator(
            new PerTransferLimit(new BigDecimal("1000.00")), new BigDecimal("1000.00"));
        assertDoesNotThrow(() -> limits.validate(transfer("b1", "900.00"), new BigDecimal("0.00")));
        assertThrows(IllegalArgumentException.class,
            () -> limits.validate(transfer("b1", "1001.00"), BigDecimal.ZERO));
        assertThrows(IllegalArgumentException.class,
            () -> limits.validate(transfer("b1", "300.00"), new BigDecimal("800.00")));
    }

    @Test void fraudChainStopsOnDenyListAndVelocity() {
        var chain = new FraudCheckChain(new DenyListCheck(Set.of("blocked")),
            new VelocityCheck(new BigDecimal("6000.00")));
        assertEquals("beneficiary is deny-listed", chain.reject(transfer("blocked", "200.00")).orElseThrow());
        assertEquals("velocity review", chain.reject(transfer("normal", "6000.01")).orElseThrow());
        assertTrue(chain.reject(transfer("normal", "200.00")).isEmpty());
    }
}
