class Card {
  pay(amount,ref) {
    return {
      provider:'card',amount,ref
    }
  }
}
class Wallet {
  pay(amount,ref) {
    return {
      provider:'wallet',amount,ref
    }
  }
}
class Billing {
  constructor(s) {
    this.s=s
  }
  checkout(a,r) {
    if (a<=0||!r)throw Error('invalid');
    return this.s.pay(a,r)
  }
}
if (new Billing(new Card()).checkout(100,'B1').provider!=='card'||new Billing(new Wallet()).checkout(100,'B1').provider!=='wallet')throw Error('strategy');
console.log('PASS');
