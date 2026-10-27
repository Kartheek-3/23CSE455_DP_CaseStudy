package br.com.michaelcruz.util;

import br.com.michaelcruz.exception.NotFoundException;
import br.com.michaelcruz.persistence.dao.AccountDAO;
import br.com.michaelcruz.persistence.dto.AccountDTO;
import br.com.michaelcruz.persistence.dto.UserDTO;
import br.com.michaelcruz.persistence.model.Account;
import br.com.michaelcruz.persistence.model.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Optional;

@ApplicationScoped
public class AccountUtil {

    @Inject
    AccountDAO accountDAO;

    //Converter de AccountDTO para Account
    public Account convertToAccount(AccountDTO accountDTO, UserDTO userDTO) {
        Account account = new Account();

        account.setType(accountDTO.getType());
        account.setBalance(accountDTO.getBalance());

        var user = new User();

        user.setId(userDTO.getId());
        account.setUser(user);

        return account;
    }

}
