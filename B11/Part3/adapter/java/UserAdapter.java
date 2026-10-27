// Adapter pattern - representative of CustomUserDetails (legalSystem
// modal/CustomUserDetails.java:10) which adapts the app's Users entity to
// Spring Security's UserDetails interface. Behaviour identical across languages.
import java.util.ArrayList;
import java.util.List;

// Adaptee: the application's own user record
class User {
    String name; String password; boolean active; List<String> roles;
    User(String name, String password, boolean active, List<String> roles) {
        this.name = name; this.password = password; this.active = active; this.roles = roles;
    }
}

// Target: the interface the security layer expects
interface UserDetails {
    String getUsername();
    String getPassword();
    boolean isEnabled();
    List<String> getAuthorities();
}

// Adapter
class UserDetailsAdapter implements UserDetails {
    private final User user;
    UserDetailsAdapter(User user) { this.user = user; }
    public String getUsername() { return user.name; }
    public String getPassword() { return user.password; }
    public boolean isEnabled() { return user.active; }
    public List<String> getAuthorities() {
        List<String> auth = new ArrayList<>();
        for (String r : user.roles) auth.add("ROLE_" + r);
        return auth;
    }
}

public class UserAdapter {
    public static void main(String[] args) {
        List<String> roles = new ArrayList<>();
        roles.add("ADMIN"); roles.add("LAWYER");
        User u = new User("rakshann", "secret", true, roles);
        UserDetails d = new UserDetailsAdapter(u);
        System.out.println("username," + d.getUsername());
        System.out.println("password," + d.getPassword());
        System.out.println("enabled," + d.isEnabled());
        System.out.println("authorities," + String.join("|", d.getAuthorities()));
    }
}
