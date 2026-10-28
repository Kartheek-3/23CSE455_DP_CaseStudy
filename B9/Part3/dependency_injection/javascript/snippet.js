class Service{constructor(repository,notifier){this.repository=repository;this.notifier=notifier;}complete(id){this.repository.push(id);this.notifier.push("sent:"+id);}}
function demo(){const r=[],n=[];new Service(r,n).complete("t1");return r[0]==="t1"&&n[0]==="sent:t1";}module.exports={demo};

