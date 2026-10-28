public class AdapterTest {
    public static void main(String[] args) {
        PaymentReceipt actual = AdapterExample.result();
        if (!actual.asLine().equals("status=APPROVED,amount_cents=2599,reference=legacy-25.99")) {
            throw new AssertionError("Adapter did not normalize the legacy response");
        }
        System.out.println("Adapter tests passed: 1/1");
    }
}
