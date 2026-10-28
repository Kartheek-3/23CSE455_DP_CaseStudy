class Pending { next(){return new Completed();} } class Completed { next(){throw Error("terminal");} } class Transaction { constructor(){this.state=new Pending();} complete(){this.state=this.state.next();} }
function demo(){const t=new Transaction();t.complete();try{t.complete();}catch(e){return t.state instanceof Completed;}return false;} module.exports={demo};

