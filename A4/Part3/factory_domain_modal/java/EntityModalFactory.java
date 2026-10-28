package factory;

public interface EntityModalFactory {
    interface EntityModalController {
        String getDomain();
        String getEntityId();
        String renderAction();
    }

    class LightModalController implements EntityModalController {
        private final String entityId;
        public LightModalController(String entityId) { this.entityId = entityId; }
        @Override public String getDomain() { return "light"; }
        @Override public String getEntityId() { return entityId; }
        @Override public String renderAction() { return "RENDER_LIGHT_CONTROLS"; }
    }

    class SwitchModalController implements EntityModalController {
        private final String entityId;
        public SwitchModalController(String entityId) { this.entityId = entityId; }
        @Override public String getDomain() { return "switch"; }
        @Override public String getEntityId() { return entityId; }
        @Override public String renderAction() { return "RENDER_SWITCH_TOGGLE"; }
    }

    class SensorModalController implements EntityModalController {
        private final String entityId;
        public SensorModalController(String entityId) { this.entityId = entityId; }
        @Override public String getDomain() { return "sensor"; }
        @Override public String getEntityId() { return entityId; }
        @Override public String renderAction() { return "RENDER_SENSOR_GRAPH"; }
    }

    class ClimateModalController implements EntityModalController {
        private final String entityId;
        public ClimateModalController(String entityId) { this.entityId = entityId; }
        @Override public String getDomain() { return "climate"; }
        @Override public String getEntityId() { return entityId; }
        @Override public String renderAction() { return "RENDER_CLIMATE_HVAC"; }
    }

    class GenericModalController implements EntityModalController {
        private final String entityId;
        private final String domain;
        public GenericModalController(String entityId, String domain) {
            this.entityId = entityId;
            this.domain = domain;
        }
        @Override public String getDomain() { return domain; }
        @Override public String getEntityId() { return entityId; }
        @Override public String renderAction() { return "RENDER_GENERIC_ATTRIBUTES"; }
    }

    class ModalFactory {
        public static String extractDomain(String entityId) {
            if (entityId == null || !entityId.contains(".")) return "unknown";
            return entityId.substring(0, entityId.indexOf('.'));
        }

        public EntityModalController createModal(String entityId) {
            String domain = extractDomain(entityId);
            switch (domain) {
                case "light": return new LightModalController(entityId);
                case "switch": return new SwitchModalController(entityId);
                case "sensor": return new SensorModalController(entityId);
                case "climate": return new ClimateModalController(entityId);
                default: return new GenericModalController(entityId, domain);
            }
        }
    }
}
