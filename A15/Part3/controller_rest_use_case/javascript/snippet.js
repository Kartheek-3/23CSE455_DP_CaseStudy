class AccountController {                       // GRASP Controller: receives the system event, no business rules
  constructor(service) { this.service = service; }   // Delegate (any object offering create/deposit/withdraw/listAll)
  create(userId, kind, balance) { this.service.create(userId, kind, balance); return { status: 201, message: 'Account created' }; }
  deposit(accountId, amount) { this.service.deposit(accountId, amount); return { status: 200, message: 'Deposit done' }; }
  withdraw(accountId, amount) { this.service.withdraw(accountId, amount); return { status: 200, message: 'Withdraw done' }; }
  list() { return { status: 200, message: String(this.service.listAll().length) }; }
}

module.exports = { AccountController };
