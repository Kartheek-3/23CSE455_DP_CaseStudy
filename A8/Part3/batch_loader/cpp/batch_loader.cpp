#include <functional>
#include <map>
#include <memory>
#include <optional>
#include <set>
#include <string>
#include <vector>

template <typename V>
struct Ticket {
    std::optional<V> value;
};

template <typename V>
class BatchLoader {
public:
    using BatchFn = std::function<std::vector<std::optional<V>>(const std::vector<std::string>&)>;

    explicit BatchLoader(BatchFn batchFn) : batchFn_(batchFn) {}

    std::shared_ptr<Ticket<V>> load(const std::string& key) {
        if (cache_.find(key) == cache_.end()) {
            cache_[key] = std::make_shared<Ticket<V>>();
            pending_.push_back(key);
        }
        return cache_[key];
    }

    void dispatch() {
        if (pending_.empty()) {
            return;
        }
        std::vector<std::string> keys;
        keys.swap(pending_);
        std::vector<std::optional<V>> values = batchFn_(keys);
        for (size_t i = 0; i < keys.size(); i++) {
            cache_[keys[i]]->value = values[i];
        }
    }

private:
    BatchFn batchFn_;
    std::map<std::string, std::shared_ptr<Ticket<V>>> cache_;
    std::vector<std::string> pending_;
};

struct User {
    std::string id;
    std::string name;
};

class UserRepository {
public:
    explicit UserRepository(std::vector<User> users) : users_(users) {}

    std::vector<User> findByIds(const std::vector<std::string>& ids) {
        std::string joined;
        for (size_t i = 0; i < ids.size(); i++) {
            joined += (i > 0 ? "," : "") + ids[i];
        }
        queries.push_back(joined);
        std::set<std::string> wanted(ids.begin(), ids.end());
        std::vector<User> found;
        for (const User& user : users_) {
            if (wanted.count(user.id) > 0) {
                found.push_back(user);
            }
        }
        return found;
    }

    std::vector<std::string> queries;

private:
    std::vector<User> users_;
};

BatchLoader<User>::BatchFn createUserBatchFn(UserRepository& repo) {
    return [&repo](const std::vector<std::string>& ids) {
        std::map<std::string, User> byId;
        for (const User& user : repo.findByIds(ids)) {
            byId[user.id] = user;
        }
        std::vector<std::optional<User>> ordered;
        for (const std::string& id : ids) {
            auto it = byId.find(id);
            ordered.push_back(it == byId.end() ? std::nullopt : std::optional<User>(it->second));
        }
        return ordered;
    };
}
