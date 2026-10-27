public class Snippet {
  static class Transfer { String sender, receiver; int amount; Transfer(String s, String r, int a) { sender=s; receiver=r; amount=a; } }
  static class TransferBuilder { String sender, receiver; Integer amount;
    TransferBuilder from(String s) { sender=s; return this; } TransferBuilder to(String r) { receiver=r; return this; }
    TransferBuilder forAmount(int a) { amount=a; return this; }
    Transfer build() { if(sender==null || receiver==null || amount==null) throw new IllegalStateException("missing field"); return new Transfer(sender,receiver,amount); }
  }
  public static boolean demo() { Transfer t=new TransferBuilder().from("a").to("b").forAmount(10).build(); return t.sender.equals("a") && t.receiver.equals("b") && t.amount==10; }
}

