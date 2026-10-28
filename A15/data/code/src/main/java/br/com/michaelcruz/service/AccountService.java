package br.com.michaelcruz.service;

import br.com.michaelcruz.exception.BadRequestException;
import br.com.michaelcruz.exception.NotFoundException;
import br.com.michaelcruz.persistence.dao.AccountDAO;
import br.com.michaelcruz.persistence.model.AccountType;
import br.com.michaelcruz.util.AccountUtil;
import br.com.michaelcruz.persistence.dto.AccountDTO;
import br.com.michaelcruz.persistence.dto.UserDTO;
import br.com.michaelcruz.persistence.model.Account;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;

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
                double newBalance = account.getBalance() + amount;

                if(account.getType() == AccountType.CONTA_POUPANCA){
                    newBalance += 0.5;
                }

                account.setBalance(newBalance);
                accountDAO.update(account);
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

            if(amount > 0 && account.getBalance() > amount) {
                double newBalance = account.getBalance() - amount;

                account.setBalance(newBalance);

                accountDAO.update(account);
            } else {
                throw new BadRequestException("Valor do saque indisponível na conta");
            }
        } else {
            throw new NotFoundException("Conta informada não encontrada");
        }
    }

    public List<Account> listAllAccounts(){
        return this.accountDAO.getAll();
    }

}
