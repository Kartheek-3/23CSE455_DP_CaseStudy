import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

class NoUser extends RuntimeException { }
class NotFound extends RuntimeException { }

class UserRepo {                               // Collaborator
    private final Set<Long> ids = new HashSet<>();
    void add(long id) { ids.add(id); }
    void require(long id) { if (!ids.contains(id)) throw new NoUser(); }
}

class AccountRepo {                            // Collaborator
    private final List<Double> balances = new ArrayList<>();
    long save(long userId, double balance) { balances.add(balance); return balances.size(); }
    double get(long id) {
        if (id < 1 || id > balances.size()) throw new NotFound();
        return balances.get((int) id - 1);
    }
}

class BankService {                            // ServiceLayer: one boundary that coordinates the use cases
    private final UserRepo users;
    private final AccountRepo accounts;
    BankService(UserRepo users, AccountRepo accounts) { this.users = users; this.accounts = accounts; }
    void createUser(long id) { users.add(id); }
    long openAccount(long userId, double balance) {
        users.require(userId);                 // use case: look up the owner first,
        return accounts.save(userId, balance); // then store the account
    }
    double balance(long accountId) { return accounts.get(accountId); }
}
