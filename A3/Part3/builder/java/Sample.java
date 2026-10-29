import java.util.Map;
import java.util.HashMap;
public class Sample {
    public static class HeaderBuilder {
        private final Map<String,String> headers=new HashMap<>();
        public HeaderBuilder add(String key,String value) {
            if(key.isEmpty()) throw new IllegalArgumentException("key required");
            headers.put(key,value);
            return this;
        }
        public HeaderBuilder remove(String key) { headers.remove(key); return this; }
        public Map<String,String> build() { return new HashMap<>(headers); }
    }
}
