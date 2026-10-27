import java.util.*;
public class Snippet { interface Observer {void completed(String id);} static class Publisher {List<Observer> all=new ArrayList<>();void subscribe(Observer o){all.add(o);}void publish(String id){all.forEach(o->o.completed(id));}}
 public static boolean demo(){List<String> seen=new ArrayList<>();Publisher p=new Publisher();p.subscribe(x->seen.add("email:"+x));p.subscribe(x->seen.add("audit:"+x));p.publish("t1");return seen.equals(List.of("email:t1","audit:t1"));} }

