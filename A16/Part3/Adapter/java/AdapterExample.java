interface PaymentProvider {
    PaymentReceipt charge(int amountCents);
}

record PaymentReceipt(String status, int amountCents, String reference) {
    String asLine() {
        return "status=" + status + ",amount_cents=" + amountCents + ",reference=" + reference;
    }
}

final class LegacyGateway {
    String authorize(double amountDollars) {
        return "legacy-" + String.format(java.util.Locale.ROOT, "%.2f", amountDollars);
    }
}

final class LegacyGatewayAdapter implements PaymentProvider {
    private final LegacyGateway gateway;

    LegacyGatewayAdapter(LegacyGateway gateway) {
        this.gateway = gateway;
    }

    public PaymentReceipt charge(int amountCents) {
        String reference = gateway.authorize(amountCents / 100.0);
        return new PaymentReceipt("APPROVED", amountCents, reference);
    }
}

public class AdapterExample {
    static PaymentReceipt result() {
        return new LegacyGatewayAdapter(new LegacyGateway()).charge(2599);
    }

    public static void main(String[] args) {
        System.out.println(result().asLine());
    }
}
