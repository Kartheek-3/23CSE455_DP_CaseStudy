// Adapter pattern - mirrors UserAdapter.java. Representative of
// CustomUserDetails in legalSystem modal/CustomUserDetails.java:10.

class User {                                  // Adaptee
  constructor(name, password, active, roles) {
    this.name = name; this.password = password;
    this.active = active; this.roles = roles;
  }
}

class UserDetailsAdapter {                    // Adapter implements Target
  constructor(user) { this.user = user; }
  getUsername() { return this.user.name; }
  getPassword() { return this.user.password; }
  isEnabled() { return this.user.active; }
  getAuthorities() { return this.user.roles.map((r) => `ROLE_${r}`); }
}

function main() {
  const u = new User("rakshann", "secret", true, ["ADMIN", "LAWYER"]);
  const d = new UserDetailsAdapter(u);
  console.log(`username,${d.getUsername()}`);
  console.log(`password,${d.getPassword()}`);
  console.log(`enabled,${d.isEnabled()}`);
  console.log(`authorities,${d.getAuthorities().join("|")}`);
}

main();
