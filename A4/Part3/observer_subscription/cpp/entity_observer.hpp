#ifndef ENTITY_OBSERVER_HPP
#define ENTITY_OBSERVER_HPP

#include <string>
#include <map>
#include <vector>
#include <memory>
#include <algorithm>

class EntitySubscriptionObserver {
public:
    virtual ~EntitySubscriptionObserver() = default;
    virtual void onEntityUpdate(
        const std::string& entityId,
        const std::string& state,
        const std::map<std::string, std::string>& attributes
    ) = 0;
};

class EntityRecord {
private:
    std::string entityId;
    std::string state;
    std::map<std::string, std::string> attributes;
public:
    EntityRecord(std::string entityId, std::string state, std::map<std::string, std::string> attributes);
    const std::string& getEntityId() const;
    const std::string& getState() const;
    const std::map<std::string, std::string>& getAttributes() const;
};

class EntityHub {
private:
    std::map<std::string, EntityRecord> entityStates;
    std::vector<EntitySubscriptionObserver*> observers;
public:
    void subscribe(EntitySubscriptionObserver* observer);
    void unsubscribe(EntitySubscriptionObserver* observer);
    void updateEntity(
        const std::string& entityId,
        const std::string& state,
        const std::map<std::string, std::string>& attributes = {}
    );
    const EntityRecord* getEntity(const std::string& entityId) const;
    size_t getObserverCount() const;
};

#endif // ENTITY_OBSERVER_HPP
