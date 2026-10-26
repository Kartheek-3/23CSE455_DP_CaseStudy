public class Snippet { record TransferRequest(String sender,String receiver,int amount){}static String toCommand(TransferRequest r){return r.sender()+":"+r.receiver()+":"+r.amount();}
 public static boolean demo(){return toCommand(new TransferRequest("a","b",10)).equals("a:b:10");} }

