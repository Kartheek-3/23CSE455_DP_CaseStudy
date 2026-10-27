class Publisher { constructor(){this.observers=[];} subscribe(observer){this.observers.push(observer);} publish(id){this.observers.forEach(o=>o(id));} }
function demo(){const seen=[],p=new Publisher();p.subscribe(id=>seen.push("email:"+id));p.subscribe(id=>seen.push("audit:"+id));p.publish("t1");return JSON.stringify(seen)===JSON.stringify(["email:t1","audit:t1"]);} module.exports={demo};

