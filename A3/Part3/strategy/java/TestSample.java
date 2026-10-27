import java.nio.file.*;
public class TestSample {
    static String execute(String a,String b,String c) {
        boolean[] used={false};
        Sample.SecondFactor strategy=a.equals("totp") ? new Sample.Totp(code->code.equals("123456"))
            :new Sample.Recovery(code->{if(!code.equals("R-1")||used[0])return false;used[0]=true;return true;});
        Sample.Login login=new Sample.Login(strategy);
        return (login.authenticate(b)?"ok":"fail")+":"+(login.authenticate(b)?"ok":"fail");
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
