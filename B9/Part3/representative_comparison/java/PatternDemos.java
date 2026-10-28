import java.math.BigDecimal;
import java.util.*;

public class PatternDemos {
  record Money(BigDecimal amount, String currency) {}
  interface ConversionStrategy { Money convert(Money money, String target); }
  static class FixedRate implements ConversionStrategy { public Money convert(Money m, String t) { return new Money(m.amount().multiply(new BigDecimal("0.92")), t); } }
  static class SameCurrency implements ConversionStrategy { public Money convert(Money m, String t) { if (!m.currency().equals(t)) throw new IllegalArgumentException(); return m; } }
  static class ConversionFactory { ConversionStrategy select(String from, String to) { return from.equals(to) ? new SameCurrency() : new FixedRate(); } }
  interface TransactionObserver { void completed(String id); }
  static class Publisher { List<TransactionObserver> observers = new ArrayList<>(); void subscribe(TransactionObserver o) { observers.add(o); } void publish(String id) { observers.forEach(o -> o.completed(id)); } }
  static void check(boolean condition) { if (!condition) throw new AssertionError("fixture check failed"); }
  public static void main(String[] args) {
    ConversionFactory f = new ConversionFactory();
    Money converted = f.select("USD", "EUR").convert(new Money(new BigDecimal("10"), "USD"), "EUR");
    check(converted.amount().equals(new BigDecimal("9.20")));
    Money same = f.select("EUR", "EUR").convert(new Money(new BigDecimal("10"), "EUR"), "EUR");
    check(same.amount().equals(new BigDecimal("10")) && same.currency().equals("EUR"));
    List<String> events = new ArrayList<>(); Publisher p = new Publisher();
    p.subscribe(x -> events.add("email:" + x)); p.subscribe(x -> events.add("audit:" + x)); p.publish("t1");
    check(events.size() == 2); check(events.equals(List.of("email:t1", "audit:t1")));
    System.out.println("4/4 passed");
  }
}
