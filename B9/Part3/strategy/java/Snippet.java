public class Snippet { interface Conversion{double convert(double a);}static class FixedRate implements Conversion{public double convert(double a){return a*.92;}}static class SameCurrency implements Conversion{public double convert(double a){return a;}}static class Factory{Conversion select(String s,String t){return s.equals(t)?new SameCurrency():new FixedRate();}}
 public static boolean demo(){Factory f=new Factory();return Math.abs(f.select("USD","EUR").convert(10)-9.2)<1e-9&&f.select("EUR","EUR").convert(10)==10;} }

