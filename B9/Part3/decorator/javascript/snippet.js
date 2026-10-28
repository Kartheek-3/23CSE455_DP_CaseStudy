class PerTransferLimit{allow(amount){return amount<=1000;}}class DailyLimit{constructor(wrapped){this.wrapped=wrapped;this.used=0;}allow(amount){if(!this.wrapped.allow(amount)||this.used+amount>1000)return false;this.used+=amount;return true;}}
function demo(){const p=new DailyLimit(new PerTransferLimit());return p.allow(600)&&!p.allow(500);}module.exports={demo};

