package factory;

public class TestRunner {
    public static void main(String[] args) {
        long start = System.nanoTime();

        EntityModalFactory.ModalFactory factory = new EntityModalFactory.ModalFactory();

        int passed = 0;
        int total = 5;

        // Test 1: Light modal
        EntityModalFactory.EntityModalController m1 = factory.createModal("light.kitchen");
        if ("light".equals(m1.getDomain()) && "RENDER_LIGHT_CONTROLS".equals(m1.renderAction())) passed++;

        // Test 2: Switch modal
        EntityModalFactory.EntityModalController m2 = factory.createModal("switch.water_heater");
        if ("switch".equals(m2.getDomain()) && "RENDER_SWITCH_TOGGLE".equals(m2.renderAction())) passed++;

        // Test 3: Sensor modal
        EntityModalFactory.EntityModalController m3 = factory.createModal("sensor.living_room_temp");
        if ("sensor".equals(m3.getDomain()) && "RENDER_SENSOR_GRAPH".equals(m3.renderAction())) passed++;

        // Test 4: Climate modal
        EntityModalFactory.EntityModalController m4 = factory.createModal("climate.main_floor");
        if ("climate".equals(m4.getDomain()) && "RENDER_CLIMATE_HVAC".equals(m4.renderAction())) passed++;

        // Test 5: Generic fallback modal
        EntityModalFactory.EntityModalController m5 = factory.createModal("unknown_domain.device_123");
        if ("unknown_domain".equals(m5.getDomain()) && "RENDER_GENERIC_ATTRIBUTES".equals(m5.renderAction())) passed++;

        long elapsedNanos = System.nanoTime() - start;
        double elapsedMs = elapsedNanos / 1_000_000.0;

        System.out.printf("RESULT: %d/%d passed\n", passed, total);
        System.out.printf("TIME_MS: %.3f\n", elapsedMs);

        if (passed != total) {
            System.exit(1);
        }
    }
}
