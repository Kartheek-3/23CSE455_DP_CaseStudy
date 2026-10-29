import java.util.*;
public class Snippet { static class Wallet { String id; int balance; Wallet(String i,int b){id=i;balance=b;} }
  static class WalletRepository { Map<String,Wallet> items=new HashMap<>(); void save(Wallet w){items.put(w.id,w);} Wallet find(String id){return items.get(id);} }
  public static boolean demo(){WalletRepository r=new WalletRepository();r.save(new Wallet("a",10));return r.find("a").balance==10&&r.find("missing")==null;} }

