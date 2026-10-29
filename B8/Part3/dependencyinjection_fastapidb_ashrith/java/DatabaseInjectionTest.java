public class DatabaseInjectionTest {
 public static void main(String[] args){
  DatabaseSession db=new SqliteSession(); MemberRepository repo=new MemberRepository(db);
  if(!repo.listMembers().equals("database result")) throw new AssertionError();
  System.out.println("Database injection test passed");
 }
}
