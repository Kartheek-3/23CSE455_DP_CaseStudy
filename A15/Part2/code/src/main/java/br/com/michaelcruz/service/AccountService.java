package br.com.michaelcruz.service;

import br.com.michaelcruz.domain.policy.AccountPolicyResolver;
import br.com.michaelcruz.event.TransactionAuditLog;
import br.com.michaelcruz.event.TransactionEvent;
import br.com.michaelcruz.event.TransactionKind;
import br.com.michaelcruz.exception.BadRequestException;
import br.com.michaelcruz.exception.NotFoundException;
import br.com.michaelcruz.persistence.dao.AccountDAO;
import br.com.michaelcruz.persistence.dto.AccountDTO;
import br.com.michaelcruz.persistence.dto.UserDTO;
import br.com.michaelcruz.persistence.model.Account;
import br.com.michaelcruz.util.AccountUtil;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class AccountService {
    @Inject
    AccountDAO accountDAO;

    @Inject
    UserService userService;

    @Inject
    AccountUtil accountUtil;

    @Inject
    AccountPolicyResolver policyResolver;

    @Inject
    Event<TransactionEvent> transactionEvents;

    @Inject
    TransactionAuditLog auditLog;


    public void createAccount(@Valid AccountDTO accountDTO) {
        UserDTO userDTO = userService.getUserDetails(accountDTO.getUserId());
        Account account = accountUtil.convertToAccount(accountDTO, userDTO);
        accountDAO.save(account);
    }

    @Transactional
    public void depositToAccount(@Valid Long accountId, double amount) {
        Account account = loadAccount(accountId);

        account.deposit(amount, policyResolver.forType(account.getType()));

        accountDAO.update(account);
        publish(accountId, TransactionKind.DEPOSIT, amount, account.getBalance());
    }

    @Transactional
    public void withdraw(@Valid Long accountId, double amount) {
        Account account = loadAccount(accountId);

        account.withdraw(amount, policyResolver.forType(account.getType()));

        accountDAO.update(account);
        publish(accountId, TransactionKind.WITHDRAWAL, amount, account.getBalance());
    }

    /** Moves money atomically: all rules are checked on the in-memory accounts before either is persisted. */
    @Transactional
    public void transfer(Long fromAccountId, Long toAccountId, double amount) {
        if (fromAccountId == null || toAccountId == null) {
            throw new BadRequestException("Conta de origem e conta de destino precisam ser informadas");
        }
        if (fromAccountId.equals(toAccountId)) {
            throw new BadRequestException("Conta de origem e conta de destino precisam ser diferentes");
        }
        if (amount <= 0) {
            throw new BadRequestException("Valor da transferência precisa ser maior que zero");
        }

        Account from = loadAccount(fromAccountId);
        Account to = loadAccount(toAccountId);

        from.withdraw(amount, policyResolver.forType(from.getType()));
        to.credit(amount);

        accountDAO.update(from);
        accountDAO.update(to);
        publish(fromAccountId, TransactionKind.TRANSFER_OUT, amount, from.getBalance());
        publish(toAccountId, TransactionKind.TRANSFER_IN, amount, to.getBalance());
    }

    public List<TransactionEvent> getAuditTrail(Long accountId) {
        accountDAO.findById(accountId);                 // 404 when the account does not exist
        return auditLog.entriesFor(accountId);
    }

    public List<Account> listAllAccounts(){
        return this.accountDAO.getAll();
    }

    private Account loadAccount(Long accountId) {
        return accountDAO.findById(accountId)
                .orElseThrow(() -> new NotFoundException("Conta informada não encontrada"));
    }

    private void publish(Long accountId, TransactionKind kind, double amount, double balanceAfter) {
        transactionEvents.fire(new TransactionEvent(accountId, kind, amount, balanceAfter, Instant.now()));
    }

}
