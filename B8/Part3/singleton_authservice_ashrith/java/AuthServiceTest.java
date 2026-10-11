public class AuthServiceTest {
 public static void main(String[] args){
  if(AuthService.getInstance()!=AuthService.getInstance()) throw new AssertionError();
  System.out.println("AuthService Singleton test passed");
 }
}
