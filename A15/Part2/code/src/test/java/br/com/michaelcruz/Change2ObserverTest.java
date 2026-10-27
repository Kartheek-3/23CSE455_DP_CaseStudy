package br.com.michaelcruz;

import br.com.michaelcruz.event.*;
import br.com.michaelcruz.persistence.dto.AccountDTO;
import br.com.michaelcruz.persistence.dto.TransactionDTO;
import br.com.michaelcruz.persistence.dto.UserDTO;
import br.com.michaelcruz.persistence.model.AccountType;
import br.com.michaelcruz.support.TestApp;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/** CH02 acceptance: transaction events with an audit-log observer and a high-value-alert observer. */
class Change2ObserverTest {

    TestApp app;
    TransactionAuditLog audit;
    HighValueAlertObserver alerts;

    @BeforeEach
    void setUp() {
        app = new TestApp();
        audit = app.c.get(TransactionAuditLog.class);
        alerts = app.c.get(HighValueAlertObserver.class);
        UserDTO u = new UserDTO();
        u.setName("Caio"); u.setAge(22); u.setPhone("555-0102"); u.setAddress("Rua C");
        app.users.createUser(u);
        open(AccountType.CONTA_CORRENTE, 100.0);
        open(AccountType.CONTA_POUPANCA, 50.0);
    }

    private void open(AccountType type, double balance) {
        AccountDTO dto = new AccountDTO();
        dto.setType(type); dto.setBalance(balance); dto.setUserId(1L);
        app.accounts.createAccount(dto);
    }

    private static TransactionDTO tx(double a) { TransactionDTO t = new TransactionDTO(); t.setAmount(a); return t; }

    @Test
    void ac1DepositPublishesOneEventWithTheResultingBalance() {
        app.accounts.depositToAccount(1L, tx(25.0));
        List<TransactionEvent> e = audit.entriesFor(1L);
        assertEquals(1, e.size());
        assertEquals(TransactionKind.DEPOSIT, e.get(0).kind());
        assertEquals(25.0, e.get(0).amount(), 0.0001);
        assertEquals(125.0, e.get(0).balanceAfter(), 0.0001);
        assertNotNull(e.get(0).at());
    }

    @Test
    void ac2WithdrawalPublishesAWithdrawalEvent() {
        app.accounts.withdraw(1L, tx(40.0));
        List<TransactionEvent> e = audit.entriesFor(1L);
        assertEquals(1, e.size());
        assertEquals(TransactionKind.WITHDRAWAL, e.get(0).kind());
        assertEquals(60.0, e.get(0).balanceAfter(), 0.0001);
    }

    @Test
    void ac3FailedOperationsPublishNothing() {
        assertThrows(WebApplicationException.class, () -> app.accounts.depositToAccount(1L, tx(0)));
        assertThrows(WebApplicationException.class, () -> app.accounts.withdraw(2L, tx(9999)));
        assertThrows(WebApplicationException.class, () -> app.accounts.depositToAccount(77L, tx(5)));
        assertEquals(0, audit.entriesFor(1L).size());
        assertEquals(0, audit.entriesFor(2L).size());
    }

    @Test
    void ac4AuditTrailIsPerAccountAndChronological() {
        app.accounts.depositToAccount(1L, tx(1.0));
        app.accounts.depositToAccount(2L, tx(2.0));
        app.accounts.withdraw(1L, tx(3.0));
        List<TransactionEvent> a = audit.entriesFor(1L);
        assertEquals(2, a.size());
        assertEquals(TransactionKind.DEPOSIT, a.get(0).kind());
        assertEquals(TransactionKind.WITHDRAWAL, a.get(1).kind());
        assertEquals(1, audit.entriesFor(2L).size());
    }

    @Test
    void ac5AuditEndpointReturnsTheTrailAndNotFoundForUnknownAccount() {
        app.accounts.depositToAccount(1L, tx(10.0));
        Response r = app.accounts.listAudit(1L);
        assertEquals(200, r.getStatus());
        assertEquals(1, ((List<?>) r.getEntity()).size());
        assertEquals(404, assertThrows(WebApplicationException.class, () -> app.accounts.listAudit(99L)).getResponse().getStatus());
    }

    @Test
    void ac6HighValueTransactionsRaiseAnAlertAtTheThreshold() {
        app.accounts.depositToAccount(1L, tx(HighValueAlertObserver.THRESHOLD - 0.01));
        assertEquals(0, alerts.alerts().size());
        app.accounts.depositToAccount(1L, tx(HighValueAlertObserver.THRESHOLD));
        assertEquals(1, alerts.alerts().size());
        assertEquals(HighValueAlertObserver.THRESHOLD, alerts.alerts().get(0).amount(), 0.0001);
    }

    @Test
    void ac7AccountServiceKnowsNoConcreteObserver() throws Exception {
        // the publisher depends only on Event<TransactionEvent> and the audit log used for reading
        boolean referencesAlert = false;
        for (var f : br.com.michaelcruz.service.AccountService.class.getDeclaredFields())
            if (f.getType() == HighValueAlertObserver.class) referencesAlert = true;
        assertFalse(referencesAlert);
    }
}
