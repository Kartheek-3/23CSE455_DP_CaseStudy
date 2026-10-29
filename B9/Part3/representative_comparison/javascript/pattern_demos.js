class Money { constructor(amount, currency) { this.amount = amount; this.currency = currency; } }
class FixedRate { convert(money, target) { return new Money(money.amount * 0.92, target); } }
class SameCurrency { convert(money, target) { if (money.currency !== target) throw new Error("currency mismatch"); return money; } }
class ConversionFactory { select(source, target) { return source === target ? new SameCurrency() : new FixedRate(); } }
class Publisher { constructor() { this.observers = []; } subscribe(observer) { this.observers.push(observer); } publish(id) { this.observers.forEach(observer => observer(id)); } }
const assert = require("node:assert/strict");
const factory = new ConversionFactory(); const usdToEur = factory.select("USD", "EUR").convert(new Money(10, "USD"), "EUR");
assert.equal(Math.round(usdToEur.amount * 100), 920);
assert.equal(usdToEur.currency, "EUR");
const same = factory.select("EUR", "EUR").convert(new Money(10, "EUR"), "EUR");
assert.deepEqual(same, new Money(10, "EUR"));
const seen = []; const publisher = new Publisher(); publisher.subscribe(id => seen.push(`email:${id}`)); publisher.subscribe(id => seen.push(`audit:${id}`)); publisher.publish("t1");
assert.equal(seen.length, 2);
assert.deepEqual(seen, ["email:t1", "audit:t1"]);
console.log("4/4 passed");
