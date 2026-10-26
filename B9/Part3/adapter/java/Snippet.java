public class Snippet { static class VendorFx{double quote(String pair){if(!pair.equals("USDEUR"))throw new IllegalArgumentException();return .92;}}static class RateProvider{VendorFx vendor;RateProvider(VendorFx v){vendor=v;}double rate(String s,String t){return vendor.quote(s+t);}}
 public static boolean demo(){return new RateProvider(new VendorFx()).rate("USD","EUR")==.92;} }

