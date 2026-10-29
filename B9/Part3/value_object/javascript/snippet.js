class Money{constructor(amount,currency){if(amount<0||!currency)throw Error("invalid money");this.amount=amount;this.currency=currency;Object.freeze(this);} equals(other){return this.amount===other.amount&&this.currency===other.currency;}}
function demo(){return new Money(10,"EUR").equals(new Money(10,"EUR"))&&!new Money(10,"EUR").equals(new Money(10,"USD"));}module.exports={demo};

