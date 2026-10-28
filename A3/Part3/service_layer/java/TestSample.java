import java.nio.file.*;
public class TestSample {
    static String execute(String a,String b,String c) {
        class Memory implements Sample.Store {
            Sample.Account account=c.equals("yes")?new Sample.Account(Long.parseLong(a)):null;
            public Sample.Account load(){return account;}
            public void save(Sample.Account value){account=value;}
        }
        Memory store=new Memory();int[] notices={0};
        new Sample.PostingService(store,()->notices[0]++).post(Long.parseLong(b));
        return (store.account==null?"missing":Long.toString(store.account.balance))+":"+notices[0];
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
