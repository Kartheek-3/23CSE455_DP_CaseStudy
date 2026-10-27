#pragma once
#include <map>
#include <optional>
#include <stdexcept>
#include <string>
#include <vector>

using Entity = std::map<std::string, std::string>;

class EntityNotFound : public std::runtime_error {
public:
    EntityNotFound() : std::runtime_error("EntityNotFound") {}
};

// Stands in for TypeORM's Repository<T>: the persistence side.
class InMemoryRepository {
public:
    Entity insert(const Entity& entity) {
        Entity row = entity;
        row["id"] = std::to_string(++lastId_);
        rows_.push_back(row);
        return {{"id", row["id"]}};
    }

    std::optional<Entity> findOneBy(const Entity& criteria) const {
        for (const auto& row : rows_) {
            bool matches = true;
            for (const auto& [key, value] : criteria) {
                auto it = row.find(key);
                matches = matches && it != row.end() && it->second == value;
            }
            if (matches) return row;
        }
        return std::nullopt;
    }

    Entity findOneOrFail(const Entity& criteria) const {
        auto row = findOneBy(criteria);
        if (!row) throw EntityNotFound();
        return *row;
    }

    size_t count() const { return rows_.size(); }

private:
    std::vector<Entity> rows_;
    int lastId_ = 0;
};

// Misskey's extension, mixed into any repository: insert, then read the stored row back.
template <class Base>
class MiRepository : public Base {
public:
    Entity insertOne(const Entity& entity) {
        Entity identifiers = this->insert(entity);
        return this->findOneOrFail(identifiers);
    }
};

using UsersRepository = MiRepository<InMemoryRepository>;

class UserService {
public:
    explicit UserService(UsersRepository& users) : users_(users) {}

    Entity registerUser(const std::string& name) { return users_.insertOne({{"name", name}}); }
    std::optional<Entity> findByName(const std::string& name) const { return users_.findOneBy({{"name", name}}); }
    Entity getByName(const std::string& name) const { return users_.findOneOrFail({{"name", name}}); }
    size_t count() const { return users_.count(); }

private:
    UsersRepository& users_;
};
