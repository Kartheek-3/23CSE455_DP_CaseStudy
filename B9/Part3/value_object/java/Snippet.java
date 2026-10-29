public class Snippet { record Money(int amount,String currency){Money{if(amount<0||currency==null||currency.isEmpty())throw new IllegalArgumentException("invalid money");}}
 public static boolean demo(){return new Money(10,"EUR").equals(new Money(10,"EUR"))&&!new Money(10,"EUR").equals(new Money(10,"USD"));} }

