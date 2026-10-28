// Active Record: user and role persistence. CRUDMixin is the Active Record base.
// Derived from mycodo/databases/__init__.py (CRUDMixin.save / delete), mycodo/databases/models/user.py
// (User.set_password / check_password) and mycodo/databases/models/role.py (Role). Flask-SQLAlchemy
// (db.Model, db.session) is replaced by an in-memory Session that enforces the declared unique/required
// columns; bcrypt is replaced by a std-lib FNV-1a salted stand-in (NOT secure); current_app.logger is
// replaced by Session::log. The Session stores non-owning pointers; the caller owns the records.
#pragma once
#include <algorithm>
#include <cstdint>
#include <cstdio>
#include <random>
#include <stdexcept>
#include <string>
#include <typeinfo>
#include <utility>
#include <vector>

struct IntegrityError : std::runtime_error { using std::runtime_error::runtime_error; };
struct InvalidRequestError : std::runtime_error { using std::runtime_error::runtime_error; };

class CRUDMixin;

// Stand-in for db.session plus the database tables.
class Session {
public:
    void add(CRUDMixin* obj) { pending_.push_back({"add", obj}); }
    void del(CRUDMixin* obj) {
        if (std::find(committed_.begin(), committed_.end(), obj) == committed_.end())
            throw InvalidRequestError("Instance is not persisted");
        pending_.push_back({"delete", obj});
    }
    inline void commit();
    void rollback() { pending_.clear(); }
    template <typename Model>
    long count() const {
        return std::count_if(committed_.begin(), committed_.end(),
                             [](const CRUDMixin* r) { return dynamic_cast<const Model*>(r) != nullptr; });
    }
    std::vector<std::string> log;

private:
    std::vector<CRUDMixin*> committed_;
    std::vector<std::pair<std::string, CRUDMixin*>> pending_;
};

// Active Record base: the record saves and deletes itself through its session.
class CRUDMixin {
public:
    explicit CRUDMixin(Session& session) : session_(session) {}
    virtual ~CRUDMixin() = default;
    virtual std::vector<std::string> unique_columns() const = 0;
    virtual std::vector<std::string> required_columns() const = 0;
    virtual const std::string* column(const std::string& name) const = 0;  // nullptr = NULL

    CRUDMixin* save() {  // nullptr = failed (rolled back and logged)
        try {
            session_.add(this);
            session_.commit();
            return this;
        } catch (const std::exception& error) {
            session_.rollback();
            session_.log.push_back(std::string("Failed to save due to error: ") + error.what());
            return nullptr;
        }
    }
    void del() {
        try {
            session_.del(this);
            session_.commit();
        } catch (const std::exception& error) {
            session_.log.push_back(std::string("Failed to delete: ") + error.what());
        }
    }

private:
    Session& session_;
};

void Session::commit() {
    std::vector<CRUDMixin*> rows;
    for (CRUDMixin* r : committed_)
        if (std::find(pending_.begin(), pending_.end(), std::make_pair(std::string("delete"), r)) == pending_.end()) rows.push_back(r);
    for (const auto& p : pending_) {
        if (p.first != "add") continue;
        for (const std::string& col : p.second->required_columns())
            if (!p.second->column(col)) throw IntegrityError("NOT NULL constraint failed: " + col);
        for (const std::string& col : p.second->unique_columns())
            for (const CRUDMixin* r : rows)
                if (r != p.second && typeid(*r) == typeid(*p.second) && r->column(col) && p.second->column(col) &&
                    *r->column(col) == *p.second->column(col))
                    throw IntegrityError("UNIQUE constraint failed: " + col);
        rows.push_back(p.second);
    }
    committed_ = rows;
    pending_.clear();
}

inline std::string gensalt() {
    std::random_device device;
    char salt[16];
    std::snprintf(salt, sizeof salt, "$fnv$%08x$", static_cast<unsigned>(device()));
    return salt;
}

// bcrypt.hashpw stand-in: "$fnv$<salt>$<FNV-1a 32 of salt+password>".
inline std::string hashpw(const std::string& password, const std::string& salt_or_hash) {
    const std::size_t second = salt_or_hash.find('$', 1), third = salt_or_hash.find('$', second + 1);
    if (salt_or_hash.compare(0, 5, "$fnv$") != 0 || third == std::string::npos || third == second + 1)
        throw std::invalid_argument("Invalid salt");
    const std::string salt = salt_or_hash.substr(second + 1, third - second - 1);
    std::uint32_t h = 0x811c9dc5u;
    for (unsigned char byte : salt + password) h = (h ^ byte) * 0x01000193u;
    char digest[9];
    std::snprintf(digest, sizeof digest, "%08x", static_cast<unsigned>(h));
    return "$fnv$" + salt + "$" + digest;
}

class User : public CRUDMixin {
public:
    User(Session& session, std::string name, std::string email) : CRUDMixin(session), name(std::move(name)), email(std::move(email)) {}
    std::vector<std::string> unique_columns() const override { return {"name", "email"}; }
    std::vector<std::string> required_columns() const override { return {}; }
    const std::string* column(const std::string& c) const override { return c == "name" ? &name : &email; }
    void set_password(const std::string& new_password) { password_hash = hashpw(new_password, gensalt()); }
    static std::string check_password(const std::string& password, const std::string& hashed_password) {
        return hashpw(password, hashed_password);
    }
    const std::string name, email;
    std::string password_hash;
};

class Role : public CRUDMixin {
public:
    Role(Session& session, bool has_name, std::string name) : CRUDMixin(session), has_name(has_name), name(std::move(name)) {}
    std::vector<std::string> unique_columns() const override { return {"name"}; }
    std::vector<std::string> required_columns() const override { return {"name"}; }
    const std::string* column(const std::string&) const override { return has_name ? &name : nullptr; }
    const bool has_name;
    const std::string name;
    bool edit_settings = false, view_logs = false;
};
