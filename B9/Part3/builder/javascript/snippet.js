class Transfer { constructor(sender, receiver, amount) { Object.assign(this, {sender, receiver, amount}); } }
class TransferBuilder {
  from(sender) { this.sender = sender; return this; } to(receiver) { this.receiver = receiver; return this; }
  forAmount(amount) { this.amount = amount; return this; }
  build() { if (!this.sender || !this.receiver || !this.amount) throw Error("missing field"); return new Transfer(this.sender, this.receiver, this.amount); }
}
function demo() { const t = new TransferBuilder().from("a").to("b").forAmount(10).build(); return t.sender === "a" && t.receiver === "b" && t.amount === 10; }
module.exports = { demo };

