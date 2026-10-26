import java.util.Map;
import java.util.function.Function;
public class Sample {
    public static class EmailAdapter {
        private final Function<Map<String,String>,Integer> vendor;
        public EmailAdapter(Function<Map<String,String>,Integer> vendor) { this.vendor=vendor; }
        public String send(String receiver,String message) {
            try { return vendor.apply(Map.of("to",receiver,"html",message))==202 ? "sent" : "failed"; }
            catch(RuntimeException e) { return "failed"; }
        }
    }
}
