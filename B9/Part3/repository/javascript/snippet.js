class WalletRepository { constructor() { this.items=new Map(); } save(wallet) { this.items.set(wallet.id,wallet); } find(id) { return this.items.get(id); } }
function demo(){ const repo=new WalletRepository(); repo.save({id:"a",balance:10}); return repo.find("a").balance===10 && repo.find("missing")===undefined; }
module.exports={demo};

