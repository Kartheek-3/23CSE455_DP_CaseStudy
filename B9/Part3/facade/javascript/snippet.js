class Repository { constructor() { this.balance={a:20,b:0}; } }
class WalletFacade { constructor(repo, notify) { this.repo=repo; this.notify=notify; } transfer(s,r,a) { this.repo.balance[s]-=a; this.repo.balance[r]+=a; this.notify.push("completed"); } }
function demo() { const repo=new Repository(), notices=[]; new WalletFacade(repo,notices).transfer("a","b",10); return repo.balance.a===10 && repo.balance.b===10 && notices[0]==="completed"; }
module.exports = { demo };

