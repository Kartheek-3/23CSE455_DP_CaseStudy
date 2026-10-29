#pragma once
#include <map>
#include <stdexcept>
#include <string>
#include <vector>

struct MissingDependency : std::runtime_error {
    explicit MissingDependency(const std::string& n) : std::runtime_error(n) {}
};

struct Bean {                                    // anything the container manages
    virtual ~Bean() = default;
    virtual std::vector<std::string> needs() const { return {}; }
    virtual void inject(const std::string&, Bean*) {}
};

struct Dao : Bean { virtual std::string kind() const = 0; };
struct RealDao : Dao { std::string kind() const override { return "real"; } };
struct FakeDao : Dao { std::string kind() const override { return "fake"; } };

class Service : public Bean {                    // ManagedBean with one injection point (Dao); never creates it itself
    Dao* dao_ = nullptr;
public:
    std::vector<std::string> needs() const override { return {"Dao"}; }
    void inject(const std::string&, Bean* dep) override { dao_ = dynamic_cast<Dao*>(dep); }
    std::string describe() const { return "Service->Dao:" + (dao_ ? dao_->kind() : std::string("unwired")); }
};

class Container {                                // Container: creates nothing, but wires every declared need
    std::map<std::string, Bean*> beans_;
public:
    void registerBean(const std::string& name, Bean* bean) { beans_[name] = bean; }
    Bean* get(const std::string& name) { return beans_[name]; }
    void wire() {
        for (auto& kv : beans_)
            for (const auto& need : kv.second->needs()) {
                auto it = beans_.find(need);
                if (it == beans_.end()) throw MissingDependency(need);
                kv.second->inject(need, it->second);
            }
    }
};
