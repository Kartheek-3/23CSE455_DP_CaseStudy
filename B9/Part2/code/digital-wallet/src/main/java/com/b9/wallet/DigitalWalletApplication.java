package com.b9.wallet;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;

/**
 * Final compact model used by the evolution study. In Quarkus, WalletResource
 * injects WalletService and infrastructure implementations through CDI.
 */
public final class DigitalWalletApplication {
    public record Money(BigDecimal amount, String currency) {
        public Money { if (amount == null || amount.signum() < 0 || currency == null) throw new IllegalArgumentException("invalid money"); java.util.Currency.getInstance(currency); }
    }
    public record Transfer(String id, String sender, String beneficiary, Money amount, String status, LocalDate createdOn) {}

    public static final class WalletAccount {
        private final String id, owner; private final Map<String, BigDecimal> balances = new HashMap<>();
        public WalletAccount(String id, String owner, Money openingBalance) { this.id=id; this.owner=owner; balances.put(openingBalance.currency, openingBalance.amount); }
        public String id() { return id; } public String owner() { return owner; }
        public BigDecimal balance(String currency) { return balances.getOrDefault(currency, BigDecimal.ZERO); }
        public void debit(Money amount) { BigDecimal current=balance(amount.currency); if (current.compareTo(amount.amount)<0) throw new IllegalArgumentException("insufficient funds"); balances.put(amount.currency,current.subtract(amount.amount)); }
        public void credit(Money amount) { balances.merge(amount.currency,amount.amount,BigDecimal::add); }
    }
    public record Beneficiary(String id, String ownerWalletId, String recipientWalletId, String displayName) {}
    public interface WalletRepository { void save(WalletAccount wallet); Optional<WalletAccount> find(String id); }
    @ApplicationScoped public static final class InMemoryWalletRepository implements WalletRepository {
        private final Map<String,WalletAccount> wallets=new HashMap<>(); public void save(WalletAccount w) { wallets.put(w.id(),w); } public Optional<WalletAccount> find(String id) { return Optional.ofNullable(wallets.get(id)); }
    }
    public interface BeneficiaryRepository { void save(Beneficiary beneficiary); Optional<Beneficiary> find(String ownerWalletId,String id); }
    @ApplicationScoped public static final class InMemoryBeneficiaryRepository implements BeneficiaryRepository {
        private final Map<String,Beneficiary> beneficiaries=new HashMap<>(); public void save(Beneficiary b) { beneficiaries.put(b.id(),b); }
        public Optional<Beneficiary> find(String owner,String id) { return Optional.ofNullable(beneficiaries.get(id)).filter(b -> b.ownerWalletId.equals(owner)); }
    }

    // Strategy + Simple Factory: a rate policy is selected without conditionals in WalletService.
    public interface CurrencyConversionStrategy { Money convert(Money source, String target); }
    public static final class SameCurrencyConversion implements CurrencyConversionStrategy {
        public Money convert(Money source, String target) { if (!source.currency.equals(target)) throw new IllegalArgumentException("rate required"); return source; }
    }
    public static final class FixedRateConversion implements CurrencyConversionStrategy {
        private final BigDecimal rate; public FixedRateConversion(BigDecimal rate) { this.rate = rate; }
        public Money convert(Money source, String target) { return new Money(source.amount.multiply(rate), target); }
    }
    @ApplicationScoped public static final class CurrencyStrategyFactory {
        private final ExchangeRateProvider rates; @Inject public CurrencyStrategyFactory(ExchangeRateProvider rates) { this.rates = rates; }
        public CurrencyConversionStrategy create(String from, String to) { return from.equals(to) ? new SameCurrencyConversion() : new FixedRateConversion(rates.quote(from, to)); }
    }

    // Adapter converts a third-party quotation shape to the application's conversion boundary.
    public interface ExchangeRateProvider { BigDecimal quote(String base, String counter); }
    @ApplicationScoped public static final class VendorFxClient {
        public String fetchPair(String pair) {
            if ("USDEUR".equals(pair)) return "0.92";
            throw new IllegalArgumentException("unsupported demo FX pair: " + pair);
        }
    }
    @ApplicationScoped public static final class VendorFxAdapter implements ExchangeRateProvider {
        private final VendorFxClient client; @Inject public VendorFxAdapter(VendorFxClient client) { this.client = client; }
        public BigDecimal quote(String base, String counter) { return new BigDecimal(client.fetchPair(base + counter)); }
    }

    // Authentication strategy selects a credential verification method without changing callers.
    public interface AuthenticationProvider { boolean authenticate(String subject, String credential); }
    public static final class PasswordAuthenticationProvider implements AuthenticationProvider {
        public boolean authenticate(String subject, String credential) { return subject != null && credential != null && credential.length() >= 12; }
    }
    public static final class OtpAuthenticationProvider implements AuthenticationProvider {
        public boolean authenticate(String subject, String credential) { return subject != null && credential != null && credential.matches("\\d{6}"); }
    }
    public static final class AuthenticationService {
        private final Map<String, AuthenticationProvider> providers; public AuthenticationService(Map<String, AuthenticationProvider> providers) { this.providers = providers; }
        public boolean authenticate(String method, String subject, String credential) { return Optional.ofNullable(providers.get(method)).orElseThrow().authenticate(subject, credential); }
    }

    // Chain of Responsibility: each fraud rule may reject or delegate.
    public interface FraudCheck { Optional<String> reject(Transfer transfer); }
    public static final class DenyListCheck implements FraudCheck {
        private final Set<String> blocked; public DenyListCheck(Set<String> blocked) { this.blocked = blocked; }
        public Optional<String> reject(Transfer t) { return blocked.contains(t.beneficiary) ? Optional.of("beneficiary is deny-listed") : Optional.empty(); }
    }
    public static final class VelocityCheck implements FraudCheck {
        private final BigDecimal threshold; public VelocityCheck(BigDecimal threshold) { this.threshold = threshold; }
        public Optional<String> reject(Transfer t) { return t.amount.amount.compareTo(threshold) > 0 ? Optional.of("velocity review") : Optional.empty(); }
    }
    public static final class FraudCheckChain {
        private final List<FraudCheck> checks; public FraudCheckChain(FraudCheck... checks) { this.checks = List.of(checks); }
        public Optional<String> reject(Transfer t) { return checks.stream().map(c -> c.reject(t)).filter(Optional::isPresent).map(Optional::get).findFirst(); }
    }

    // Policy Strategy separates variable regulatory/product limits from transfer orchestration.
    public interface TransactionLimitPolicy { void validate(Transfer transfer, BigDecimal dailyUsed); }
    public static final class PerTransferLimit implements TransactionLimitPolicy {
        private final BigDecimal cap; public PerTransferLimit(BigDecimal cap) { this.cap = cap; }
        public void validate(Transfer t, BigDecimal dailyUsed) { if (t.amount.amount.compareTo(cap) > 0) throw new IllegalArgumentException("per-transfer limit exceeded"); }
    }
    public static final class DailyLimitDecorator implements TransactionLimitPolicy {
        private final TransactionLimitPolicy delegate; private final BigDecimal dailyCap;
        public DailyLimitDecorator(TransactionLimitPolicy delegate, BigDecimal dailyCap) { this.delegate = delegate; this.dailyCap = dailyCap; }
        public void validate(Transfer t, BigDecimal dailyUsed) { delegate.validate(t, dailyUsed); if (dailyUsed.add(t.amount.amount).compareTo(dailyCap) > 0) throw new IllegalArgumentException("daily limit exceeded"); }
    }

    // State moves only through allowed transaction states.
    public interface TransactionState { String value(); TransactionState approve(); }
    public static final class Pending implements TransactionState { public String value() { return "PENDING"; } public TransactionState approve() { return new Completed(); } }
    public static final class Completed implements TransactionState { public String value() { return "COMPLETED"; } public TransactionState approve() { throw new IllegalStateException("already completed"); } }
    public static final class TransactionLifecycle { private TransactionState state = new Pending(); public String status() { return state.value(); } public void approve() { state = state.approve(); } }

    // Observer has one publisher and independently extensible notification subscribers.
    public interface TransactionObserver { void completed(Transfer transfer); }
    @ApplicationScoped public static final class NotificationPublisher {
        private final List<TransactionObserver> subscribers = new ArrayList<>();
        @Inject public NotificationPublisher(Instance<TransactionObserver> observers) { observers.forEach(subscribers::add); }
        public void subscribe(TransactionObserver subscriber) { subscribers.add(subscriber); }
        public void publish(Transfer transfer) { subscribers.forEach(s -> s.completed(transfer)); }
    }
    @ApplicationScoped public static final class EmailNotification implements TransactionObserver { public void completed(Transfer transfer) { System.out.println("email:" + transfer.id); } }
    @ApplicationScoped public static final class AuditNotification implements TransactionObserver { public void completed(Transfer transfer) { System.out.println("audit:" + transfer.id); } }

    // Repository abstracts persistence. Command makes a requested transfer explicit and queueable.
    public interface TransferRepository { void save(Transfer transfer); BigDecimal usedToday(String wallet, LocalDate date); }
    @ApplicationScoped public static final class InMemoryTransferRepository implements TransferRepository {
        private final List<Transfer> transfers = new ArrayList<>(); public void save(Transfer transfer) { transfers.add(transfer); }
        public BigDecimal usedToday(String wallet, LocalDate date) { return transfers.stream().filter(t -> t.sender.equals(wallet) && t.createdOn.equals(date)).map(t -> t.amount.amount).reduce(BigDecimal.ZERO, BigDecimal::add); }
    }
    public interface Command { Transfer execute(); }
    public static final class TransferCommand implements Command {
        private final WalletService service; private final String sender, beneficiary; private final Money money;
        public TransferCommand(WalletService service, String sender, String beneficiary, Money money) { this.service = service; this.sender = sender; this.beneficiary = beneficiary; this.money = money; }
        public Transfer execute() { return service.transfer(sender, beneficiary, money); }
    }

    // Facade/application service; CDI supplies dependencies in the Quarkus deployment.
    @ApplicationScoped public static final class WalletService {
        private final CurrencyStrategyFactory factory; private final FraudCheckChain fraud; private final TransactionLimitPolicy limits; private final TransferRepository repository; private final NotificationPublisher notifications; private final WalletRepository wallets; private final BeneficiaryRepository beneficiaries;
        @Inject public WalletService(CurrencyStrategyFactory f, FraudCheckChain fraud, TransactionLimitPolicy limits, TransferRepository r, NotificationPublisher n, WalletRepository w, BeneficiaryRepository b) { factory=f; this.fraud=fraud; this.limits=limits; repository=r; notifications=n; wallets=w; beneficiaries=b; }
        public WalletAccount createWallet(String id,String owner,Money opening) { WalletAccount account=new WalletAccount(id,owner,opening); wallets.save(account); return account; }
        public WalletAccount wallet(String id) { return wallets.find(id).orElseThrow(() -> new IllegalArgumentException("wallet not found")); }
        public Beneficiary addBeneficiary(String id,String owner,String recipient,String name) { wallets.find(owner).orElseThrow(); wallets.find(recipient).orElseThrow(); Beneficiary b=new Beneficiary(id,owner,recipient,name); beneficiaries.save(b); return b; }
        public Transfer transfer(String sender, String beneficiary, Money money) {
            WalletAccount senderWallet=wallets.find(sender).orElseThrow(() -> new IllegalArgumentException("sender wallet not found"));
            Beneficiary savedBeneficiary=beneficiaries.find(sender,beneficiary).orElseThrow(() -> new IllegalArgumentException("beneficiary not found for sender"));
            WalletAccount recipientWallet=wallets.find(savedBeneficiary.recipientWalletId).orElseThrow(() -> new IllegalArgumentException("recipient wallet not found"));
            Money settled = factory.create(money.currency, "EUR").convert(money, "EUR");
            Transfer draft = new Transfer(UUID.randomUUID().toString(), sender, beneficiary, settled, "PENDING", LocalDate.now());
            fraud.reject(draft).ifPresent(reason -> { throw new IllegalArgumentException(reason); });
            limits.validate(draft, repository.usedToday(sender, LocalDate.now()));
            senderWallet.debit(money); recipientWallet.credit(settled);
            Transfer completed = new Transfer(draft.id, sender, beneficiary, settled, "COMPLETED", draft.createdOn); repository.save(completed); notifications.publish(completed); return completed;
        }
    }

    @ApplicationScoped public static class WalletConfiguration {
        @jakarta.enterprise.inject.Produces
        TransactionLimitPolicy transactionLimits() { return new DailyLimitDecorator(new PerTransferLimit(new BigDecimal("1000.00")), new BigDecimal("1000.00")); }
        @jakarta.enterprise.inject.Produces
        FraudCheckChain fraudChecks() { return new FraudCheckChain(new DenyListCheck(Set.of()), new VelocityCheck(new BigDecimal("6000.00"))); }
    }
}
