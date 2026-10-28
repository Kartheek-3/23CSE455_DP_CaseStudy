package br.com.michaelcruz.service;

import br.com.michaelcruz.event.TransactionAuditLog;
import br.com.michaelcruz.event.TransactionEvent;
import br.com.michaelcruz.event.TransactionKind;
import br.com.michaelcruz.exception.BadRequestException;
import br.com.michaelcruz.exception.NotFoundException;
import br.com.michaelcruz.persistence.dao.AccountDAO;
import br.com.michaelcruz.domain.policy.AccountPolicyResolver;
import br.com.michaelcruz.util.AccountUtil;
import br.com.michaelcruz.persistence.dto.AccountDTO;
import br.com.michaelcruz.persistence.dto.UserDTO;
import br.com.michaelcruz.persistence.model.Account;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;
import jakarta.validation.Valid;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

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

    public void depositToAccount(@Valid Long accountId, double amount){

        Optional<Account> optionalAccount = accountDAO.findById(accountId);

        if(optionalAccount != null && optionalAccount.isPresent()){
            Account account = optionalAccount.get();

            if (amount > 0){
                double newBalance = account.getBalance() + amount
                        + policyResolver.forType(account.getType()).bonusOnDeposit(amount);

                account.setBalance(newBalance);
                accountDAO.update(account);
                transactionEvents.fire(new TransactionEvent(accountId, TransactionKind.DEPOSIT, amount, newBalance, Instant.now()));
            } else {
                throw new BadRequestException("Valor do depósito precisa ser maior que zero");
            }
        } else {
            throw new NotFoundException("Conta informada não encontrada");
        }
    }

    public void withdraw(@Valid Long accountId, double amount) {

        Optional<Account> optionalAccount = accountDAO.findById(accountId);

        if(optionalAccount != null && optionalAccount.isPresent()){
            Account account = optionalAccount.get();

            if(amount > 0 && policyResolver.forType(account.getType()).allowsWithdrawal(account.getBalance(), amount)) {
                double newBalance = account.getBalance() - amount;

                account.setBalance(newBalance);

                accountDAO.update(account);
                transactionEvents.fire(new TransactionEvent(accountId, TransactionKind.WITHDRAWAL, amount, newBalance, Instant.now()));
            } else {
                throw new BadRequestException("Valor do saque indisponível na conta");
            }
        } else {
            throw new NotFoundException("Conta informada não encontrada");
        }
    }

    public List<TransactionEvent> getAuditTrail(Long accountId) {
        accountDAO.findById(accountId);                 // 404 when the account does not exist
        return auditLog.entriesFor(accountId);
    }

    public List<Account> listAllAccounts(){
        return this.accountDAO.getAll();
    }

}
