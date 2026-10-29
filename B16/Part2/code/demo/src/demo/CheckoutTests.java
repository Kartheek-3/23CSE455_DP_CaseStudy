package demo;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

// Small demo suite for Part 2. "flaky" tests stand for tests a team wants to quarantine.
class CheckoutTests {

	@Test
	@Tag("smoke")
	void fastTotal() {
		assertEquals(30, 10 + 20);
	}

	@Test
	void fastDiscount() {
		assertEquals(90, 100 - 10);
	}

	@Test
	@Tag("flaky")
	void paymentGatewayTimeout() {
		assertEquals("OK", "TIMEOUT", "simulated flaky external call");
	}
}
