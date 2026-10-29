import java.util.HashMap;
import java.util.Map;

class BadRequest extends RuntimeException { }
class NotFound extends RuntimeException { }

class Account {                                  // DomainObject: data AND the rules that protect it
    static final double OVERDRAFT_LIMIT = 500.0;
    private final String kind;
    private double balance;
    Account(String kind, double balance) { this.kind = kind; this.balance = balance; }
    double balance() { return balance; }

    void deposit(double amount) {
        if (amount <= 0) throw new BadRequest();
        balance += amount + (kind.equals("S") ? 0.5 : 0.0);
    }

    void withdraw(double amount) {
        boolean allowed = kind.equals("C") ? balance - amount >= -OVERDRAFT_LIMIT : amount <= balance;
        if (amount <= 0 || !allowed) throw new BadRequest();
        balance -= amount;
    }

    void credit(double amount) {
        if (amount <= 0) throw new BadRequest();
        balance += amount;
    }
}

class Bank {                                     // Orchestrator: loads, calls the domain object, nothing more
    private final Map<Long, Account> accounts = new HashMap<>();
    private long next = 1;

    long open(String kind, double balance) { accounts.put(next, new Account(kind, balance)); return next++; }

    private Account find(long id) {
        Account a = accounts.get(id);
        if (a == null) throw new NotFound();
        return a;
    }

    double deposit(long id, double amount) { Account a = find(id); a.deposit(amount); return a.balance(); }
    double withdraw(long id, double amount) { Account a = find(id); a.withdraw(amount); return a.balance(); }

    void transfer(long fromId, long toId, double amount) {
        if (fromId == toId || amount <= 0) throw new BadRequest();
        Account source = find(fromId), target = find(toId);
        source.withdraw(amount);                 // throws before anything is changed
        target.credit(amount);
    }

    double balance(long id) { return find(id).balance(); }
}
