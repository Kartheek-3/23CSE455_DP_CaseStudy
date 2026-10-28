package demo;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("flaky")
class InventoryTests {

	@Test
	void warehouseSync() {
		assertTrue(false, "simulated flaky warehouse sync");
	}
}
