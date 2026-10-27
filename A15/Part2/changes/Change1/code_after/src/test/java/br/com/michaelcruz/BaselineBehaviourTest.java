package br.com.michaelcruz;

import br.com.michaelcruz.exception.BadRequestException;
import br.com.michaelcruz.exception.NotFoundException;
import br.com.michaelcruz.persistence.dto.AccountDTO;
import br.com.michaelcruz.persistence.dto.TransactionDTO;
import br.com.michaelcruz.persistence.dto.UserDTO;
import br.com.michaelcruz.persistence.model.Account;
import br.com.michaelcruz.persistence.model.AccountType;
import br.com.michaelcruz.persistence.model.User;
import br.com.michaelcruz.support.TestApp;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/** Characterization tests: they pin the behaviour of the original code, including its quirks. */
class BaselineBehaviourTest {

    TestApp app;

    @BeforeEach
    void setUp() {
        app = new TestApp();
        UserDTO u = new UserDTO();
        u.setName("Ana"); u.setAge(30); u.setPhone("555-0100"); u.setAddress("Rua A");
        app.users.createUser(u);                       // user id 1
    }

    private Account open(AccountType type, double balance) {
        AccountDTO dto = new AccountDTO();
        dto.setType(type); dto.setBalance(balance); dto.setUserId(1L);
        app.accounts.createAccount(dto);
        List<Account> all = app.accountService.listAllAccounts();
        return all.get(all.size() - 1);
    }

    private static TransactionDTO tx(double amount) {
        TransactionDTO t = new TransactionDTO(); t.setAmount(amount); return t;
    }

    private static int status(Runnable r) {
        return assertThrows(WebApplicationException.class, r).getResponse().getStatus();
    }

    @Test
    void createUserStoresAllFields() {
        User u = app.c.db().em().find(User.class, 1L);
        assertEquals("Ana", u.getName());
        assertEquals(30, u.getAge());
        assertEquals("555-0100", u.getPhone());
        assertEquals("Rua A", u.getAddress());
    }

    @Test
    void createAccountLinksUserAndKeepsBalance() {
        Account a = open(AccountType.CONTA_CORRENTE, 100.0);
        assertEquals(AccountType.CONTA_CORRENTE, a.getType());
        assertEquals(100.0, a.getBalance(), 0.0001);
        assertEquals(Long.valueOf(1L), a.getUser().getId());
    }

    @Test
    void createAccountEndpointReturns201() {
        AccountDTO dto = new AccountDTO();
        dto.setType(AccountType.CONTA_POUPANCA); dto.setBalance(10); dto.setUserId(1L);
        Response r = app.accounts.createAccount(dto);
        assertEquals(201, r.getStatus());
        assertEquals("Conta criada com sucesso", r.getEntity());
    }

    @Test
    void depositToCheckingAddsExactAmount() {
        open(AccountType.CONTA_CORRENTE, 100.0);
        Response r = app.accounts.depositToAccount(1L, tx(50.0));
        assertEquals(200, r.getStatus());
        assertEquals(150.0, app.accountService.listAllAccounts().get(0).getBalance(), 0.0001);
    }

    @Test
    void depositToSavingsAddsAmountPlusHalfBonus() {
        open(AccountType.CONTA_POUPANCA, 100.0);
        app.accounts.depositToAccount(1L, tx(50.0));
        assertEquals(150.5, app.accountService.listAllAccounts().get(0).getBalance(), 0.0001);
    }

    @Test
    void depositOfZeroOrNegativeIsBadRequestAndBalanceUnchanged() {
        open(AccountType.CONTA_CORRENTE, 100.0);
        assertEquals(400, status(() -> app.accounts.depositToAccount(1L, tx(0))));
        assertEquals(400, status(() -> app.accounts.depositToAccount(1L, tx(-5))));
        assertEquals(100.0, app.accountService.listAllAccounts().get(0).getBalance(), 0.0001);
    }

    @Test
    void depositToUnknownAccountIsNotFound() {
        assertEquals(404, status(() -> app.accounts.depositToAccount(99L, tx(10))));
    }

    @Test
    void withdrawReducesBalance() {
        open(AccountType.CONTA_CORRENTE, 100.0);
        Response r = app.accounts.withdraw(1L, tx(40.0));
        assertEquals(200, r.getStatus());
        assertEquals(60.0, app.accountService.listAllAccounts().get(0).getBalance(), 0.0001);
    }

    @Test
    void withdrawOfExactlyTheBalanceIsAllowedAfterCh01() {   // CH01 intentionally changed this baseline quirk
        open(AccountType.CONTA_CORRENTE, 100.0);
        assertEquals(200, app.accounts.withdraw(1L, tx(100.0)).getStatus());
        assertEquals(0.0, app.accountService.listAllAccounts().get(0).getBalance(), 0.0001);
    }

    @Test
    void withdrawMoreThanBalanceOrNonPositiveIsBadRequest() {
        open(AccountType.CONTA_POUPANCA, 100.0);
        assertEquals(400, status(() -> app.accounts.withdraw(1L, tx(100.01))));
        assertEquals(400, status(() -> app.accounts.withdraw(1L, tx(0))));
        assertEquals(100.0, app.accountService.listAllAccounts().get(0).getBalance(), 0.0001);
    }

    @Test
    void withdrawFromUnknownAccountIsNotFound() {
        assertEquals(404, status(() -> app.accounts.withdraw(42L, tx(1))));
    }

    @Test
    void listAccountsReturnsAllAccounts() {
        open(AccountType.CONTA_CORRENTE, 1);
        open(AccountType.CONTA_POUPANCA, 2);
        Response r = app.accounts.listAccounts();
        assertEquals(200, r.getStatus());
        assertEquals(2, ((List<?>) r.getEntity()).size());
    }

    @Test
    void errorsAreCarriedAsHttpResponsesByTheCustomExceptions() {
        assertEquals(400, new BadRequestException("x").getResponse().getStatus());
        assertEquals("x", new BadRequestException("x").getResponse().getEntity());
        assertEquals(404, new NotFoundException("y").getResponse().getStatus());
    }

    // ---- known defects of the original code, pinned so that later changes are visible ----

    @Test
    void defectCreatingAnAccountForAnUnknownUserFailsWithNullPointerNotNotFound() {
        AccountDTO dto = new AccountDTO();
        dto.setType(AccountType.CONTA_CORRENTE); dto.setBalance(1); dto.setUserId(777L);
        assertThrows(NullPointerException.class, () -> app.accounts.createAccount(dto));
    }

    @Test
    void defectUserDaoGetAllReturnsNull() {
        assertNull(app.userDAO.getAll());
    }
}
