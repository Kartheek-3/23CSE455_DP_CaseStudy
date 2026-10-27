public class PlansServiceTest {
 public static void main(String[] args){
  if(PlansService.getInstance()!=PlansService.getInstance()) throw new AssertionError();
  System.out.println("PlansService Singleton test passed");
 }
}
