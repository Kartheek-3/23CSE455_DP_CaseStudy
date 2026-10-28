import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Active Record: user and role persistence. CRUDMixin is the Active Record base.
 * Derived from mycodo/databases/__init__.py (CRUDMixin.save / delete), mycodo/databases/models/user.py
 * (User.set_password / check_password) and mycodo/databases/models/role.py (Role). Flask-SQLAlchemy
 * (db.Model, db.session) is replaced by an in-memory Session that enforces the declared unique/required
 * columns; bcrypt is replaced by a std-lib FNV-1a salted stand-in (NOT secure); current_app.logger is
 * replaced by Session.log.
 */
public abstract class CRUDMixin {
    protected final Session session;

    protected CRUDMixin(Session session) { this.session = session; }

    abstract String[] uniqueColumns();
    abstract String[] requiredColumns();
    abstract Object column(String name);

    /** Returns this record, or null if saving failed (the session is rolled back and the error logged). */
    public CRUDMixin save() {
        try {
            session.add(this);
            session.commit();
            return this;
        } catch (RuntimeException error) {
            session.rollback();
            session.log.add("Failed to save " + this + " due to error: " + error.getMessage());
            return null;
        }
    }

    public void delete() {
        try {
            session.delete(this);
            session.commit();
        } catch (RuntimeException error) {
            session.log.add("Failed to delete '" + this + "': '" + error.getMessage() + "'");
        }
    }
}

class IntegrityError extends RuntimeException {
    IntegrityError(String message) { super(message); }
}

class InvalidRequestError extends RuntimeException {
    InvalidRequestError(String message) { super(message); }
}

/** Stand-in for db.session plus the database tables. */
class Session {
    private List<CRUDMixin> committed = new ArrayList<>();
    private final List<Object[]> pending = new ArrayList<>();
    final List<String> log = new ArrayList<>();

    void add(CRUDMixin obj) { pending.add(new Object[] {"add", obj}); }

    void delete(CRUDMixin obj) {
        if (!committed.contains(obj)) throw new InvalidRequestError("Instance " + obj + " is not persisted");
        pending.add(new Object[] {"delete", obj});
    }

    void commit() {
        List<CRUDMixin> rows = new ArrayList<>();
        for (CRUDMixin r : committed) {
            boolean deleted = false;
            for (Object[] p : pending) deleted |= p[0].equals("delete") && p[1] == r;
            if (!deleted) rows.add(r);
        }
        for (Object[] p : pending) {
            if (!p[0].equals("add")) continue;
            CRUDMixin obj = (CRUDMixin) p[1];
            for (String column : obj.requiredColumns())
                if (obj.column(column) == null) throw new IntegrityError("NOT NULL constraint failed: " + column);
            for (String column : obj.uniqueColumns())
                for (CRUDMixin r : rows)
                    if (r != obj && r.getClass() == obj.getClass() && Objects.equals(r.column(column), obj.column(column)))
                        throw new IntegrityError("UNIQUE constraint failed: " + column);
            rows.add(obj);
        }
        committed = rows;
        pending.clear();
    }

    void rollback() { pending.clear(); }

    long count(Class<?> model) { return committed.stream().filter(r -> r.getClass() == model).count(); }
}

class User extends CRUDMixin {
    final String name, email;
    String passwordHash;

    User(Session session, String name, String email) {
        super(session);
        this.name = name;
        this.email = email;
    }

    String[] uniqueColumns() { return new String[] {"name", "email"}; }
    String[] requiredColumns() { return new String[] {}; }
    Object column(String column) { return column.equals("name") ? name : email; }

    static String gensalt() {
        byte[] bytes = new byte[4];
        new SecureRandom().nextBytes(bytes);
        StringBuilder salt = new StringBuilder("$fnv$");
        for (byte b : bytes) salt.append(String.format("%02x", b & 0xff));
        return salt.append('$').toString();
    }

    /** bcrypt.hashpw stand-in: "$fnv$<salt>$<FNV-1a 32 of salt+password>". */
    static String hashpw(String password, String saltOrHash) {
        String[] parts = saltOrHash.split("\\$", -1);
        if (parts.length < 4 || !parts[0].isEmpty() || !parts[1].equals("fnv") || parts[2].isEmpty())
            throw new IllegalArgumentException("Invalid salt");
        int h = 0x811c9dc5;
        for (byte b : (parts[2] + password).getBytes(StandardCharsets.UTF_8)) {
            h ^= (b & 0xff);
            h *= 0x01000193;
        }
        return "$fnv$" + parts[2] + "$" + String.format("%08x", h);
    }

    void setPassword(String newPassword) { passwordHash = hashpw(newPassword, gensalt()); }

    static String checkPassword(String password, String hashedPassword) { return hashpw(password, hashedPassword); }
}

class Role extends CRUDMixin {
    final String name;
    boolean editSettings = false, viewLogs = false;

    Role(Session session, String name) {
        super(session);
        this.name = name;
    }

    String[] uniqueColumns() { return new String[] {"name"}; }
    String[] requiredColumns() { return new String[] {"name"}; }
    Object column(String column) { return name; }
}
