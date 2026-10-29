import java.util.*;
public class Snippet { static class Service{List<String> repository,notifier;Service(List<String> r,List<String> n){repository=r;notifier=n;}void complete(String id){repository.add(id);notifier.add("sent:"+id);}}
 public static boolean demo(){List<String> r=new ArrayList<>(),n=new ArrayList<>();new Service(r,n).complete("t1");return r.equals(List.of("t1"))&&n.equals(List.of("sent:t1"));} }

