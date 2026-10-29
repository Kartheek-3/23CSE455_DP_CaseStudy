import java.nio.file.*;
public class TestSample {
    static String execute(String a,String b,String c) {
        return new Sample.EmailAdapter(payload -> {
            if(!payload.get("to").equals(a)||!payload.get("html").equals(b))throw new AssertionError("payload");
            if(c.equals("throw"))throw new RuntimeException("simulated");
            return Integer.parseInt(c);
        }).send(a,b);
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
