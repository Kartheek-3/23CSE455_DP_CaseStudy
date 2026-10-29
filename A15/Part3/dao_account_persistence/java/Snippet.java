import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

class NotFound extends RuntimeException {
    NotFound(String m) { super(m); }
}

class Account {                                   // TransferObject
    final long id;
    final double balance;
    Account(long id, double balance) { this.id = id; this.balance = balance; }
}

interface AccountDao {                            // DataAccessObject (abstraction: find + list only, as in DAO<T>)
    Account findById(long id);
    List<Account> getAll();
}

class InMemoryAccountDao implements AccountDao {  // ConcreteDAO (save exists only on the concrete class)
    private final Map<Long, Account> rows = new LinkedHashMap<>();
    private long next = 1;

    public Account findById(long id) {
        Account a = rows.get(id);
        if (a == null) throw new NotFound(String.valueOf(id));
        return a;
    }

    long save(double balance) {
        Account a = new Account(next++, balance);
        rows.put(a.id, a);
        return a.id;
    }

    public List<Account> getAll() { return new ArrayList<>(rows.values()); }
}

class AccountService {                            // BusinessObject: never touches storage directly
    private final InMemoryAccountDao dao;
    AccountService(InMemoryAccountDao dao) { this.dao = dao; }
    long open(double balance) { return dao.save(balance); }
    double balanceOf(long id) { return dao.findById(id).balance; }
    List<Double> balances() {
        List<Double> out = new ArrayList<>();
        for (Account a : dao.getAll()) out.add(a.balance);
        return out;
    }
}
