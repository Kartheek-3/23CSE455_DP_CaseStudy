public class Snippet { interface Policy{boolean allow(int amount);}static class PerTransferLimit implements Policy{public boolean allow(int a){return a<=1000;}}static class DailyLimit implements Policy{Policy wrapped;int used;DailyLimit(Policy p){wrapped=p;}public boolean allow(int a){if(!wrapped.allow(a)||used+a>1000)return false;used+=a;return true;}}
 public static boolean demo(){Policy p=new DailyLimit(new PerTransferLimit());return p.allow(600)&&!p.allow(500);} }

