
#include <iostream>
#include <string>
using namespace std;

// User structure
struct User {
    int id;
    string role;
};

// Job structure
struct Job {
    int id;
    int owner_id;
};

// Abstract Strategy
class PermissionStrategy {
public:
    virtual bool has_permission(const User* user,
                                const Job* job = nullptr) const = 0;

    virtual ~PermissionStrategy() = default;
};

// Strategy 1: Check Employer
class IsEmployer : public PermissionStrategy {
public:
    bool has_permission(const User* user,
                        const Job* job = nullptr) const override {
        return user != nullptr && user->role == "employer";
    }
};

// Strategy 2: Check Employee
class IsEmployee : public PermissionStrategy {
public:
    bool has_permission(const User* user,
                        const Job* job = nullptr) const override {
        return user != nullptr && user->role == "employee";
    }
};

// Strategy 3: Check Job Creator
class IsJobCreator : public PermissionStrategy {
public:
    bool has_permission(const User* user,
                        const Job* job = nullptr) const override {
        return user != nullptr &&
               job != nullptr &&
               job->owner_id == user->id;
    }
};

// Permission checker
bool check_permission(const PermissionStrategy& strategy,
                      const User* user,
                      const Job* job = nullptr) {
    return strategy.has_permission(user, job);
}

// Main function
int main() {
    User employer = {1, "employer"};
    User employee = {2, "employee"};
    Job job = {101, 1};

    IsEmployer employerStrategy;
    IsEmployee employeeStrategy;
    IsJobCreator jobCreatorStrategy;

    cout << boolalpha;

    cout << "Employer permission: "
         << check_permission(employerStrategy, &employer) << endl;

    cout << "Employee permission: "
         << check_permission(employeeStrategy, &employee) << endl;

    cout << "Job creator permission: "
         << check_permission(jobCreatorStrategy, &employer, &job) << endl;

    return 0;
}
