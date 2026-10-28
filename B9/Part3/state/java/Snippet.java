public class Snippet { interface State{State next();} static class Pending implements State{public State next(){return new Completed();}} static class Completed implements State{public State next(){throw new IllegalStateException("terminal");}}
 static class Transaction {State state=new Pending();void complete(){state=state.next();}} public static boolean demo(){Transaction t=new Transaction();t.complete();try{t.complete();}catch(IllegalStateException e){return t.state instanceof Completed;}return false;} }

