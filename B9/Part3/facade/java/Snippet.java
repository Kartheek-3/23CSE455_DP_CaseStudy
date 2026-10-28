import java.util.*;
public class Snippet { static class Repository { Map<String,Integer> balance=new HashMap<>(Map.of("a",20,"b",0)); }
  static class WalletFacade { Repository repo; List<String> notices; WalletFacade(Repository r,List<String> n){repo=r;notices=n;}
    void transfer(String s,String r,int a){repo.balance.put(s,repo.balance.get(s)-a);repo.balance.put(r,repo.balance.get(r)+a);notices.add("completed");} }
  public static boolean demo(){Repository r=new Repository();List<String> n=new ArrayList<>();new WalletFacade(r,n).transfer("a","b",10);return r.balance.get("a")==10&&r.balance.get("b")==10&&n.equals(List.of("completed"));} }

