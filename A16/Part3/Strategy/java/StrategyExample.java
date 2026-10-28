interface DiscountStrategy {
    int apply(int amountCents);
}

final class StandardDiscount implements DiscountStrategy {
    public int apply(int amountCents) {
        return amountCents * 90 / 100;
    }
}

final class PremiumDiscount implements DiscountStrategy {
    public int apply(int amountCents) {
        return amountCents * 80 / 100;
    }
}

final class PriceCalculator {
    private final DiscountStrategy strategy;

    PriceCalculator(DiscountStrategy strategy) {
        this.strategy = strategy;
    }

    int total(int amountCents) {
        return strategy.apply(amountCents);
    }
}

public class StrategyExample {
    static int[] results() {
        return new int[]{new PriceCalculator(new StandardDiscount()).total(10000),
                new PriceCalculator(new PremiumDiscount()).total(10000)};
    }

    public static void main(String[] args) {
        int[] values = results();
        System.out.println("standard=" + values[0] + ";premium=" + values[1]);
    }
}
