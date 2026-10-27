public class Sample {
    public static class Account { public long balance; public Account(long b) { balance=b; } }
    public interface Store { Account load(); void save(Account account); }
    public static class PostingService {
        private final Store store;
        private final Runnable sender;
        public PostingService(Store store,Runnable sender) { this.store=store;this.sender=sender; }
        public boolean post(long amount) {
            Account account=store.load();
            if(account==null) return false;
            account.balance+=amount;
            store.save(account);
            sender.run();
            return true;
        }
    }
}
