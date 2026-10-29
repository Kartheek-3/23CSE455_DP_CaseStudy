import java.util.List;

class Response {
    final int status; final String message;
    Response(int status, String message) { this.status = status; this.message = message; }
}

interface BankApi {                             // what the Delegate (service layer) offers to the controller
    void create(long userId, String kind, double balance);
    void deposit(long accountId, double amount);
    void withdraw(long accountId, double amount);
    List<Long> listAll();
}

class AccountController {                       // GRASP Controller: receives the system event, no business rules
    private final BankApi service;
    AccountController(BankApi service) { this.service = service; }
    Response create(long userId, String kind, double balance) { service.create(userId, kind, balance); return new Response(201, "Account created"); }
    Response deposit(long accountId, double amount) { service.deposit(accountId, amount); return new Response(200, "Deposit done"); }
    Response withdraw(long accountId, double amount) { service.withdraw(accountId, amount); return new Response(200, "Withdraw done"); }
    Response list() { return new Response(200, String.valueOf(service.listAll().size())); }
}
