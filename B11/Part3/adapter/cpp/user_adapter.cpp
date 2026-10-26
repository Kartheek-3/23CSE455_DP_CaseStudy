// Adapter pattern - mirrors UserAdapter.java. Representative of
// CustomUserDetails in legalSystem modal/CustomUserDetails.java:10.
#include <iostream>
#include <string>
#include <vector>

struct User {                                 // Adaptee
    std::string name, password;
    bool active;
    std::vector<std::string> roles;
};

struct UserDetails {                          // Target
    virtual std::string getUsername() const = 0;
    virtual std::string getPassword() const = 0;
    virtual bool isEnabled() const = 0;
    virtual std::vector<std::string> getAuthorities() const = 0;
    virtual ~UserDetails() = default;
};

class UserDetailsAdapter : public UserDetails {   // Adapter
    const User& user;
public:
    explicit UserDetailsAdapter(const User& u) : user(u) {}
    std::string getUsername() const override { return user.name; }
    std::string getPassword() const override { return user.password; }
    bool isEnabled() const override { return user.active; }
    std::vector<std::string> getAuthorities() const override {
        std::vector<std::string> auth;
        for (const auto& r : user.roles) auth.push_back("ROLE_" + r);
        return auth;
    }
};

int main() {
    User u{"rakshann", "secret", true, {"ADMIN", "LAWYER"}};
    UserDetailsAdapter d(u);
    std::cout << "username," << d.getUsername() << "\n";
    std::cout << "password," << d.getPassword() << "\n";
    std::cout << "enabled," << (d.isEnabled() ? "true" : "false") << "\n";
    auto auth = d.getAuthorities();
    std::cout << "authorities,";
    for (size_t i = 0; i < auth.size(); ++i)
        std::cout << auth[i] << (i + 1 < auth.size() ? "|" : "");
    std::cout << "\n";
    return 0;
}
