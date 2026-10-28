class PostingService {
  constructor(store, sender) { this.store = store; this.sender = sender; }
  post(amount) {
    const account = this.store.load();
    if (account === null) return false;
    account.balance += amount;
    this.store.save(account);
    this.sender();
    return true;
  }
}
module.exports = {PostingService};
