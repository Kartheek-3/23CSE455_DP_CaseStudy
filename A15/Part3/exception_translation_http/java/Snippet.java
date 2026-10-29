import java.util.function.Supplier;

class HttpError extends RuntimeException {       // TranslatedException (base): carries the HTTP status and a message
    final int status;
    HttpError(int status, String message) { super(message); this.status = status; }
}
class BadRequest extends HttpError { BadRequest(String m) { super(400, m); } }
class NotFound extends HttpError { NotFound(String m) { super(404, m); } }

class AccountService {                           // Raiser
    String deposit(double amount) {
        if (amount <= 0) throw new BadRequest("Deposit must be positive");
        return "ok";
    }
    String find(long id) {
        if (id != 1) throw new NotFound("Account not found");
        return "account 1";
    }
    String boom() { throw new IllegalStateException("unexpected"); }
}

class Translator {                               // Translator: the boundary that turns exceptions into responses
    static String translate(Supplier<String> action) {
        try {
            return "200 " + action.get();
        } catch (HttpError e) {
            return e.status + " " + e.getMessage();
        } catch (RuntimeException e) {
            return "500 Internal error";
        }
    }
}
