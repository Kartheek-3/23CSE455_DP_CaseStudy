package br.com.michaelcruz.support;

import br.com.michaelcruz.domain.policy.AccountPolicyResolver;
import br.com.michaelcruz.event.HighValueAlertObserver;
import br.com.michaelcruz.event.TransactionAuditLog;
import br.com.michaelcruz.persistence.dao.AccountDAO;
import br.com.michaelcruz.persistence.dao.UserDAO;
import br.com.michaelcruz.rest.AccountController;
import br.com.michaelcruz.rest.UserController;
import br.com.michaelcruz.service.AccountService;
import br.com.michaelcruz.service.UserService;
import br.com.michaelcruz.util.AccountUtil;
import br.com.michaelcruz.util.UserUtil;

/** Builds the whole application object graph on an in-memory database. */
public final class TestApp {
    public final MiniContainer c = new MiniContainer();
    public final UserController users;
    public final AccountController accounts;
    public final AccountService accountService;
    public final UserService userService;
    public final AccountDAO accountDAO;
    public final UserDAO userDAO;

    public TestApp() {
        c.add(UserDAO.class); c.add(AccountDAO.class);
        c.add(UserUtil.class); c.add(AccountUtil.class);
        c.add(AccountPolicyResolver.class);
        c.add(TransactionAuditLog.class); c.add(HighValueAlertObserver.class);
        c.add(UserService.class); c.add(AccountService.class);
        c.add(UserController.class); c.add(AccountController.class);
        c.wire();
        users = c.get(UserController.class);
        accounts = c.get(AccountController.class);
        accountService = c.get(AccountService.class);
        userService = c.get(UserService.class);
        accountDAO = c.get(AccountDAO.class);
        userDAO = c.get(UserDAO.class);
    }
}
