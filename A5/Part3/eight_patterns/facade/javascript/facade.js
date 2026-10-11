class Store {
  constructor() {
    this.rows=[]
  }
  save(p,d) {
    this.rows.push([p,d]);
    return this.rows.length
  }
}
class Notice {
  constructor() {
    this.sent=[]
  }
  send(p,m) {
    this.sent.push([p,m])
  }
}
class Facade {
  constructor(s,n) {
    this.s=s;
    this.n=n
  }
  book(p,d) {
    if (!p||!d)throw Error('missing');
    const id=this.s.save(p,d);
    this.n.send(p,String(id));
    return id
  }
}
const s=new Store(),n=new Notice();
if (new Facade(s,n).book('P1','D1')!==1||n.sent.length!==1)throw Error('facade');
console.log('PASS');
