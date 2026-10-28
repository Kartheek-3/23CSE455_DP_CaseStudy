package observer;

import java.util.*;

public class TestRunner {
    static class DashboardWidgetObserver implements EntitySubscriptionObserver {
        int updateCount = 0;
        final List<String> receivedEntities = new ArrayList<>();

        @Override
        public void onEntityUpdate(String entityId, String state, Map<String, String> attributes) {
            updateCount++;
            receivedEntities.add(entityId);
        }
    }

    static class NotificationLoggerObserver implements EntitySubscriptionObserver {
        int updateCount = 0;
        final List<String> receivedEntities = new ArrayList<>();

        @Override
        public void onEntityUpdate(String entityId, String state, Map<String, String> attributes) {
            updateCount++;
            receivedEntities.add(entityId);
        }
    }

    public static void main(String[] args) {
        long start = System.nanoTime();

        EntitySubscriptionObserver.EntityHub hub = new EntitySubscriptionObserver.EntityHub();
        DashboardWidgetObserver widget = new DashboardWidgetObserver();
        NotificationLoggerObserver logger = new NotificationLoggerObserver();

        hub.subscribe(widget);
        hub.subscribe(logger);

        int passed = 0;
        int total = 5;

        // Event 1
        Map<String, String> attr1 = new HashMap<>();
        attr1.put("brightness", "100");
        hub.updateEntity("light.living_room", "on", attr1);

        // Event 2
        Map<String, String> attr2 = new HashMap<>();
        attr2.put("temperature", "21.5");
        hub.updateEntity("climate.thermostat", "cool", attr2);

        // Event 3
        Map<String, String> attr3 = new HashMap<>();
        attr3.put("battery", "95");
        hub.updateEntity("sensor.smoke", "emergency", attr3);

        // Unsubscribe logger
        hub.unsubscribe(logger);

        // Event 4
        Map<String, String> attr4 = new HashMap<>();
        attr4.put("brightness", "0");
        hub.updateEntity("light.kitchen", "off", attr4);

        // Check 1: DashboardWidget received 4 updates
        if (widget.updateCount == 4) passed++;

        // Check 2: Logger received 3 updates (none after unsubscribe)
        if (logger.updateCount == 3) passed++;

        // Check 3: State of light.living_room is on
        if (hub.getEntity("light.living_room") != null &&
            "on".equals(hub.getEntity("light.living_room").getState())) passed++;

        // Check 4: State of sensor.smoke is emergency
        if (hub.getEntity("sensor.smoke") != null &&
            "emergency".equals(hub.getEntity("sensor.smoke").getState())) passed++;

        // Check 5: Logger did not receive light.kitchen
        if (!logger.receivedEntities.contains("light.kitchen")) passed++;

        long elapsedNanos = System.nanoTime() - start;
        double elapsedMs = elapsedNanos / 1_000_000.0;

        System.out.printf("RESULT: %d/%d passed\n", passed, total);
        System.out.printf("TIME_MS: %.3f\n", elapsedMs);

        if (passed != total) {
            System.exit(1);
        }
    }
}
