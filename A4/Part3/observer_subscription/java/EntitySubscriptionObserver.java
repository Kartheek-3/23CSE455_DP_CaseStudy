package observer;

import java.util.*;

public interface EntitySubscriptionObserver {
    void onEntityUpdate(String entityId, String state, Map<String, String> attributes);

    class EntityRecord {
        private final String entityId;
        private final String state;
        private final Map<String, String> attributes;

        public EntityRecord(String entityId, String state, Map<String, String> attributes) {
            this.entityId = entityId;
            this.state = state;
            this.attributes = attributes != null ? new HashMap<>(attributes) : new HashMap<>();
        }

        public String getEntityId() { return entityId; }
        public String getState() { return state; }
        public Map<String, String> getAttributes() { return attributes; }
    }

    class EntityHub {
        private final Map<String, EntityRecord> entityStates = new HashMap<>();
        private final List<EntitySubscriptionObserver> observers = new ArrayList<>();

        public void subscribe(EntitySubscriptionObserver observer) {
            if (observer != null && !observers.contains(observer)) {
                observers.add(observer);
            }
        }

        public void unsubscribe(EntitySubscriptionObserver observer) {
            observers.remove(observer);
        }

        public void updateEntity(String entityId, String state, Map<String, String> attributes) {
            EntityRecord record = new EntityRecord(entityId, state, attributes);
            entityStates.put(entityId, record);
            notifyObservers(entityId, state, attributes);
        }

        private void notifyObservers(String entityId, String state, Map<String, String> attributes) {
            for (EntitySubscriptionObserver observer : observers) {
                observer.onEntityUpdate(entityId, state, attributes);
            }
        }

        public EntityRecord getEntity(String entityId) {
            return entityStates.get(entityId);
        }

        public int getObserverCount() {
            return observers.size();
        }
    }
}
