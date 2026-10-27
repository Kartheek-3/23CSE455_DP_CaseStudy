import java.util.HashMap;
import java.util.Map;

class BadRequest extends RuntimeException { }
class NotFound extends RuntimeException { }

class Row {                                     // RowData: data only, no behaviour (anemic)
    final String kind;
    double balance;
    Row(String kind, double balance) { this.kind = kind; this.balance = balance; }
}

class AccountScripts {                          // host of the TransactionScripts: one procedure per use case
    private final Map<Long, Row> rows = new HashMap<>();
    private long next = 1;

    long open(String kind, double balance) {
        rows.put(next, new Row(kind, balance));
        return next++;
    }

    private Row find(long id) {
        Row r = rows.get(id);
        if (r == null) throw new NotFound();
        return r;
    }

    double deposit(long id, double amount) {    // script: all rules are inline
        Row row = find(id);
        if (amount > 0) {
            double newBalance = row.balance + amount;
            if (row.kind.equals("S")) newBalance += 0.5;
            row.balance = newBalance;
            return newBalance;
        }
        throw new BadRequest();
    }

    double withdraw(long id, double amount) {   // script: all rules are inline
        Row row = find(id);
        if (amount > 0 && row.balance > amount) {
            row.balance -= amount;
            return row.balance;
        }
        throw new BadRequest();
    }
}
