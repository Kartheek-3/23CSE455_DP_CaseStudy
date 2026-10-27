package br.com.michaelcruz;

import br.com.michaelcruz.domain.policy.CheckingAccountPolicy;
import br.com.michaelcruz.domain.policy.SavingsAccountPolicy;
import br.com.michaelcruz.event.TransactionAuditLog;
import br.com.michaelcruz.event.TransactionEvent;
import br.com.michaelcruz.event.TransactionKind;
import br.com.michaelcruz.persistence.dto.*;
import br.com.michaelcruz.persistence.model.Account;
import br.com.michaelcruz.persistence.model.AccountType;
import br.com.michaelcruz.support.TestApp;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/** CH03 acceptance: atomic transfer between accounts; business rules moved into the Account domain object. */
class Change3TransferTest {

    TestApp app;

    @BeforeEach
    void setUp() {
        app = new TestApp();
        UserDTO u = new UserDTO();
        u.setName("Duda"); u.setAge(35); u.setPhone("555-0103"); u.setAddress("Rua D");
        app.users.createUser(u);
        open(AccountType.CONTA_CORRENTE, 100.0);   // id 1
        open(AccountType.CONTA_POUPANCA, 50.0);    // id 2
    }

    private void open(AccountType type, double balance) {
        AccountDTO dto = new AccountDTO();
        dto.setType(type); dto.setBalance(balance); dto.setUserId(1L);
        app.accounts.createAccount(dto);
    }

    private static TransferDTO transfer(Long from, Long to, double amount) {
        TransferDTO t = new TransferDTO(); t.setFromAccountId(from); t.setToAccountId(to); t.setAmount(amount); return t;
    }

    private double balance(int i) { return app.accountService.listAllAccounts().get(i).getBalance(); }

    private int status(Runnable r) { return assertThrows(WebApplicationException.class, r).getResponse().getStatus(); }

    @Test
    void ac1TransferMovesTheAmountWithoutDepositBonus() {
        Response r = app.accounts.transfer(transfer(1L, 2L, 30.0));
        assertEquals(200, r.getStatus());
        assertEquals(70.0, balance(0), 0.0001);
        assertEquals(80.0, balance(1), 0.0001);          // savings target: no 0.5 bonus on transfers
    }

    @Test
    void ac2InsufficientFundsChangesNeitherAccount() {
        assertEquals(400, status(() -> app.accounts.transfer(transfer(2L, 1L, 50.01))));   // savings: no overdraft
        assertEquals(100.0, balance(0), 0.0001);
        assertEquals(50.0, balance(1), 0.0001);
    }

    @Test
    void ac3CheckingSourceMayUseItsOverdraft() {
        app.accounts.transfer(transfer(1L, 2L, 600.0));
        assertEquals(-500.0, balance(0), 0.0001);
        assertEquals(650.0, balance(1), 0.0001);
    }

    @Test
    void ac4SameAccountAndNonPositiveAmountAndMissingIdsAreBadRequests() {
        assertEquals(400, status(() -> app.accounts.transfer(transfer(1L, 1L, 5))));
        assertEquals(400, status(() -> app.accounts.transfer(transfer(1L, 2L, 0))));
        assertEquals(400, status(() -> app.accounts.transfer(transfer(1L, 2L, -3))));
        assertEquals(400, status(() -> app.accounts.transfer(transfer(null, 2L, 3))));
        assertEquals(100.0, balance(0), 0.0001);
        assertEquals(50.0, balance(1), 0.0001);
    }

    @Test
    void ac5UnknownAccountIsNotFoundAndNothingChanges() {
        assertEquals(404, status(() -> app.accounts.transfer(transfer(1L, 99L, 5))));
        assertEquals(404, status(() -> app.accounts.transfer(transfer(99L, 1L, 5))));
        assertEquals(100.0, balance(0), 0.0001);
    }

    @Test
    void ac6TransferPublishesOutAndInEvents() {
        app.accounts.transfer(transfer(1L, 2L, 10.0));
        TransactionAuditLog log = app.c.get(TransactionAuditLog.class);
        List<TransactionEvent> out = log.entriesFor(1L), in = log.entriesFor(2L);
        assertEquals(TransactionKind.TRANSFER_OUT, out.get(0).kind());
        assertEquals(90.0, out.get(0).balanceAfter(), 0.0001);
        assertEquals(TransactionKind.TRANSFER_IN, in.get(0).kind());
        assertEquals(60.0, in.get(0).balanceAfter(), 0.0001);
    }

    @Test
    void ac7AccountEnforcesItsOwnRulesWithoutTheService() {       // refactoring evidence: rules live on the entity
        Account a = new Account();
        a.setType(AccountType.CONTA_POUPANCA);
        a.setBalance(10.0);
        a.deposit(5.0, new SavingsAccountPolicy());
        assertEquals(15.5, a.getBalance(), 0.0001);
        a.withdraw(15.5, new SavingsAccountPolicy());
        assertEquals(0.0, a.getBalance(), 0.0001);
        assertEquals(400, status(() -> a.withdraw(0.01, new SavingsAccountPolicy())));
        assertEquals(400, status(() -> a.deposit(0, new CheckingAccountPolicy())));
        assertEquals(400, status(() -> a.credit(-1)));
    }
}
