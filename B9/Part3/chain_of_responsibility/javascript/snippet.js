class AmountCheck{constructor(next=null){this.next=next;}allow(t){return t.amount<=1000&&(!this.next||this.next.allow(t));}}class DenyListCheck{constructor(next=null){this.next=next;}allow(t){return t.sender!=="blocked"&&(!this.next||this.next.allow(t));}}
function demo(){const c=new DenyListCheck(new AmountCheck());return c.allow({sender:"a",amount:10})&&!c.allow({sender:"blocked",amount:10});}module.exports={demo};

