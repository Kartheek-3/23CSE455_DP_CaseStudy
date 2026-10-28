public class Snippet { static class Wallet{int balance;Wallet(int b){balance=b;}}static class TransferCommand{Wallet s,r;int a;TransferCommand(Wallet s,Wallet r,int a){this.s=s;this.r=r;this.a=a;}void execute(){s.balance-=a;r.balance+=a;}}
 public static boolean demo(){Wallet s=new Wallet(20),r=new Wallet(0);new TransferCommand(s,r,10).execute();return s.balance==10&&r.balance==10;} }

