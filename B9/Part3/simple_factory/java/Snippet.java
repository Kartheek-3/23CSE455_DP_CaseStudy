public class Snippet { interface Notifier{String send();}static class Email implements Notifier{public String send(){return "email";}}static class Audit implements Notifier{public String send(){return "audit";}}static class NotifierFactory{Notifier create(String kind){return kind.equals("email")?new Email():new Audit();}}
 public static boolean demo(){NotifierFactory f=new NotifierFactory();return f.create("email").send().equals("email")&&f.create("audit").send().equals("audit");} }

