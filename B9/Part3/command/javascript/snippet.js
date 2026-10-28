class Wallet{constructor(balance){this.balance=balance;}} class TransferCommand{constructor(s,r,a){Object.assign(this,{s,r,a});}execute(){this.s.balance-=this.a;this.r.balance+=this.a;}}
function demo(){const s=new Wallet(20),r=new Wallet(0);new TransferCommand(s,r,10).execute();return s.balance===10&&r.balance===10;}module.exports={demo};

