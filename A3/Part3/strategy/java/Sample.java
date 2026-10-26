import java.util.function.Predicate;
public class Sample {
    public interface SecondFactor { boolean authenticate(String code); }
    public static class Totp implements SecondFactor {
        private final Predicate<String> provider;
        public Totp(Predicate<String> provider) {this.provider=provider;}
        public boolean authenticate(String code) {return provider.test(code);}
    }
    public static class Recovery implements SecondFactor {
        private final Predicate<String> provider;
        public Recovery(Predicate<String> provider) {this.provider=provider;}
        public boolean authenticate(String code) {return provider.test(code);}
    }
    public static class Login {
        private final SecondFactor strategy;
        public Login(SecondFactor strategy) {this.strategy=strategy;}
        public boolean authenticate(String code) {return strategy.authenticate(code);}
    }
}
