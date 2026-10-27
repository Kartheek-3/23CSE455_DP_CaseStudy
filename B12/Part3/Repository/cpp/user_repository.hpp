#pragma once

#include <map>
#include <string>
#include <utility>
#include <vector>

// Repository pattern (architectural, data-access) -- in-memory User repository.
// Production snippet. Tests live in repository_test.cpp.

struct User {
    int id;
    std::string name;

    User(int id_, std::string name_) : id(id_), name(std::move(name_)) {}
};

class UserRepository {
public:
    virtual ~UserRepository() = default;

    virtual User save(const User& user) = 0;
    virtual const User* findById(int id) const = 0;
    virtual std::vector<User> findAll() const = 0;
    virtual bool deleteById(int id) = 0;
};

class InMemoryUserRepository : public UserRepository {
public:
    User save(const User& user) override {
        store_.insert_or_assign(user.id, user);
        return user;
    }

    const User* findById(int id) const override {
        auto it = store_.find(id);
        return it == store_.end() ? nullptr : &it->second;
    }

    std::vector<User> findAll() const override {
        std::vector<User> out;
        for (const auto& entry : store_) {
            out.push_back(entry.second);
        }
        return out;
    }

    bool deleteById(int id) override {
        return store_.erase(id) > 0;
    }

private:
    std::map<int, User> store_;
};

class UserService {
public:
    explicit UserService(UserRepository* repository) : repository_(repository) {}

    User registerUser(const User& user) { return repository_->save(user); }
    const User* get(int id) const { return repository_->findById(id); }
    std::vector<User> all() const { return repository_->findAll(); }
    bool remove(int id) { return repository_->deleteById(id); }

private:
    UserRepository* repository_;
};
