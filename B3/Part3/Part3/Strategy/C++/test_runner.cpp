#include <iostream>
#include <string>
#include <cassert>
using namespace std;

struct User {
    int id;
    string role;
};

struct Job {
    int id;
    int owner_id;
};

// Strategy interface
class Permission {
public:
    virtual bool has_permission(const User& user,
                                const Job* job = nullptr) const = 0;
    virtual ~Permission() = default;
};

// Employer permission strategy
class IsEmployer : public Permission {
public:
    bool has_permission(const User& user,
                        const Job* job = nullptr) const override {
        return user.role == "employer";
    }
};

// Employee permission strategy
class IsEmployee : public Permission {
public:
    bool has_permission(const User& user,
                        const Job* job = nullptr) const override {
        return user.role == "employee";
    }
};

// Job creator permission strategy
class IsJobCreator : public Permission {
public:
    bool has_permission(const User& user,
                        const Job* job = nullptr) const override {
        return job != nullptr &&
               user.role == "employer" &&
               user.id == job->owner_id;
    }
};

// Permission checker
bool check_permission(const Permission& permission,
                      const User& user,
                      const Job* job = nullptr) {
    return permission.has_permission(user, job);
}

// Test cases
void test_employer_permission() {
    User employer{1, "employer"};
    User employee{2, "employee"};

    IsEmployer permission;

    assert(check_permission(permission, employer) == true);
    assert(check_permission(permission, employee) == false);

    cout << "PASS: Employer permission" << endl;
}

void test_employee_permission() {
    User employer{1, "employer"};
    User employee{2, "employee"};

    IsEmployee permission;

    assert(check_permission(permission, employee) == true);
    assert(check_permission(permission, employer) == false);

    cout << "PASS: Employee permission" << endl;
}

void test_job_creator_permission() {
    User employer{1, "employer"};
    User other_employer{3, "employer"};

    Job job{101, 1};

    IsJobCreator permission;

    assert(check_permission(permission, employer, &job) == true);
    assert(check_permission(permission, other_employer, &job) == false);
    assert(check_permission(permission, employer, nullptr) == false);

    cout << "PASS: Job creator permission" << endl;
}

int main() {
    test_employer_permission();
    test_employee_permission();
    test_job_creator_permission();

    cout << "All Strategy tests passed." << endl;

    return 0;
}