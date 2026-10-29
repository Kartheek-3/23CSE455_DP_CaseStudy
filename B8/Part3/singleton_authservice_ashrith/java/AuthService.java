public final class AuthService {
 private static final AuthService INSTANCE=new AuthService();
 private AuthService(){}
 public static AuthService getInstance(){return INSTANCE;}
}
