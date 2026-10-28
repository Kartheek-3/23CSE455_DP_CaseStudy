package br.com.michaelcruz;

import br.com.michaelcruz.domain.policy.*;
import br.com.michaelcruz.persistence.dto.AccountDTO;
import br.com.michaelcruz.persistence.dto.TransactionDTO;
import br.com.michaelcruz.persistence.dto.UserDTO;
import br.com.michaelcruz.persistence.model.Account;
import br.com.michaelcruz.persistence.model.AccountType;
import br.com.michaelcruz.support.TestApp;
import jakarta.ws.rs.WebApplicationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/** CH01 acceptance: account-type policies (Strategy), overdraft for checking, exact-balance withdrawal. */
class Change1PolicyTest {

    TestApp app;

    @BeforeEach
    void setUp() {
        app = new TestApp();
        UserDTO u = new UserDTO();
        u.setName("Bia"); u.setAge(41); u.setPhone("555-0101"); u.setAddress("Rua B");
        app.users.createUser(u);
    }

    private void open(AccountType type, double balance) {
        AccountDTO dto = new AccountDTO();
        dto.setType(type); dto.setBalance(balance); dto.setUserId(1L);
        app.accounts.createAccount(dto);
    }

    private static TransactionDTO tx(double a) { TransactionDTO t = new TransactionDTO(); t.setAmount(a); return t; }

    private double balance(int index) { return app.accountService.listAllAccounts().get(index).getBalance(); }

    private int status(Runnable r) { return assertThrows(WebApplicationException.class, r).getResponse().getStatus(); }

    @Test
    void ac1CheckingMayOverdrawUpToTheLimit() {
        open(AccountType.CONTA_CORRENTE, 100.0);
        app.accounts.withdraw(1L, tx(600.0));
        assertEquals(-500.0, balance(0), 0.0001);
    }

    @Test
    void ac2CheckingCannotOverdrawBeyondTheLimit() {
        open(AccountType.CONTA_CORRENTE, 100.0);
        assertEquals(400, status(() -> app.accounts.withdraw(1L, tx(600.01))));
        assertEquals(100.0, balance(0), 0.0001);
    }

    @Test
    void ac3SavingsCannotOverdraw() {
        open(AccountType.CONTA_POUPANCA, 100.0);
        assertEquals(400, status(() -> app.accounts.withdraw(1L, tx(100.01))));
        assertEquals(100.0, balance(0), 0.0001);
    }

    @Test
    void ac4SavingsMayWithdrawExactlyTheBalance() {
        open(AccountType.CONTA_POUPANCA, 100.0);
        app.accounts.withdraw(1L, tx(100.0));
        assertEquals(0.0, balance(0), 0.0001);
    }

    @Test
    void ac5SavingsDepositBonusIsPreservedAndCheckingHasNone() {
        open(AccountType.CONTA_POUPANCA, 10.0);
        open(AccountType.CONTA_CORRENTE, 10.0);
        app.accounts.depositToAccount(1L, tx(5.0));
        app.accounts.depositToAccount(2L, tx(5.0));
        assertEquals(15.5, balance(0), 0.0001);
        assertEquals(15.0, balance(1), 0.0001);
    }

    @Test
    void ac6NonPositiveWithdrawalStillRejectedForBothTypes() {
        open(AccountType.CONTA_CORRENTE, 100.0);
        open(AccountType.CONTA_POUPANCA, 100.0);
        assertEquals(400, status(() -> app.accounts.withdraw(1L, tx(0))));
        assertEquals(400, status(() -> app.accounts.withdraw(2L, tx(-1))));
    }

    @Test
    void resolverReturnsTheMatchingStrategyAndRejectsMissingType() {
        AccountPolicyResolver r = new AccountPolicyResolver();
        assertTrue(r.forType(AccountType.CONTA_CORRENTE) instanceof CheckingAccountPolicy);
        assertTrue(r.forType(AccountType.CONTA_POUPANCA) instanceof SavingsAccountPolicy);
        assertEquals(400, status(() -> r.forType(null)));
    }

    @Test
    void policiesAreInterchangeableBehindTheInterface() {
        AccountPolicy checking = new CheckingAccountPolicy();
        AccountPolicy savings = new SavingsAccountPolicy();
        assertTrue(checking.allowsWithdrawal(0, 500));
        assertFalse(savings.allowsWithdrawal(0, 0.01));
        assertEquals(0.5, savings.bonusOnDeposit(1000), 0.0001);
        assertEquals(0.0, checking.bonusOnDeposit(1000), 0.0001);
    }
}
