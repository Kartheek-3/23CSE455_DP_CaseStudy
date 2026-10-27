class Email{send(){return "email";}}class Audit{send(){return "audit";}}class NotifierFactory{create(kind){return kind==="email"?new Email():new Audit();}}
function demo(){const f=new NotifierFactory();return f.create("email").send()==="email"&&f.create("audit").send()==="audit";}module.exports={demo};

