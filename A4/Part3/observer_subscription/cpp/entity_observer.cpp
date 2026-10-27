#include "entity_observer.hpp"

EntityRecord::EntityRecord(std::string entityId, std::string state, std::map<std::string, std::string> attributes)
    : entityId(std::move(entityId)), state(std::move(state)), attributes(std::move(attributes)) {}

const std::string& EntityRecord::getEntityId() const { return entityId; }
const std::string& EntityRecord::getState() const { return state; }
const std::map<std::string, std::string>& EntityRecord::getAttributes() const { return attributes; }

void EntityHub::subscribe(EntitySubscriptionObserver* observer) {
    if (observer && std::find(observers.begin(), observers.end(), observer) == observers.end()) {
        observers.push_back(observer);
    }
}

void EntityHub::unsubscribe(EntitySubscriptionObserver* observer) {
    auto it = std::find(observers.begin(), observers.end(), observer);
    if (it != observers.end()) {
        observers.erase(it);
    }
}

void EntityHub::updateEntity(
    const std::string& entityId,
    const std::string& state,
    const std::map<std::string, std::string>& attributes
) {
    EntityRecord record(entityId, state, attributes);
    entityStates.erase(entityId);
    entityStates.emplace(entityId, record);
    for (auto* obs : observers) {
        if (obs) {
            obs->onEntityUpdate(entityId, state, attributes);
        }
    }
}

const EntityRecord* EntityHub::getEntity(const std::string& entityId) const {
    auto it = entityStates.find(entityId);
    if (it != entityStates.end()) {
        return &(it->second);
    }
    return nullptr;
}

size_t EntityHub::getObserverCount() const {
    return observers.size();
}
