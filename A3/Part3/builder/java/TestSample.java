import java.nio.file.*;
public class TestSample {
    static String execute(String a,String b,String c) {
        try {return new Sample.HeaderBuilder().add("X-Test","old").add(a,b).remove(c).build().getOrDefault("X-Test","missing");}
        catch(IllegalArgumentException e){return "error";}
    }
    public static void main(String[]args)throws Exception {
        int count=0;
        for(String line:Files.readAllLines(Path.of(args[0]))) {
            String[] f=line.split("\t",-1);
            String actual=execute(f[0],f[1],f[2]);
            if(!actual.equals(f[3]))throw new AssertionError(line+" actual="+actual);
            count++;
        }
        System.out.println("PASS "+count+"/"+count);
    }
}
