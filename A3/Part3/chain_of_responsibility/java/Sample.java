public class Sample {
    public abstract static class Rule {
        private final Rule next;
        protected Rule(Rule next) {this.next=next;}
        protected abstract boolean accepts(long amount,long balance);
        public boolean allows(long amount,long balance) {
            return accepts(amount,balance) && (next==null || next.allows(amount,balance));
        }
    }
    public static class Positive extends Rule {
        public Positive(Rule next) {super(next);}
        protected boolean accepts(long amount,long balance) {return amount>0;}
    }
    public static class Funds extends Rule {
        public Funds(Rule next) {super(next);}
        protected boolean accepts(long amount,long balance) {return amount<=balance;}
    }
    public static class HighValue extends Rule {
        private final long limit;
        public HighValue(long limit) {
            super(null);
            if(limit<=0)throw new IllegalArgumentException("positive limit required");
            this.limit=limit;
        }
        protected boolean accepts(long amount,long balance) {return amount<=limit;}
    }
}
