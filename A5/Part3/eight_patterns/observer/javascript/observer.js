class Observer {
  constructor() {
    this.events=[]
  }
  update(e) {
    this.events.push(e)
  }
}
class Publisher {
  constructor() {
    this.subs=new Set()
  }
  subscribe(o) {
    this.subs.add(o)
  }
  unsubscribe(o) {
    this.subs.delete(o)
  }
  publish(e) {
    for (const o of this.subs)o.update(e)
  }
}
const p=new Publisher(),o=new Observer();
p.subscribe(o);
p.publish('lab.ready');
p.unsubscribe(o);
p.publish('other');
if (o.events.join()!=='lab.ready')throw Error('observer');
console.log('PASS');
