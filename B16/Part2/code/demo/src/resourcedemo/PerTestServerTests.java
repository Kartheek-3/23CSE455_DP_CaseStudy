package resourcedemo;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.sun.net.httpserver.HttpServer;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.extension.support.ManagedResource;

// Test scope: each test gets its own server, shared with its @BeforeEach and stopped after its @AfterEach,
// also when the test fails.
@TestMethodOrder(MethodOrderer.MethodName.class)
class PerTestServerTests {

	@BeforeEach
	void beforeEach(@ManagedResource(HttpServerFactory.class) HttpServer server) {
		System.out.println("[demo] @BeforeEach got server :" + server.getAddress().getPort());
	}

	@Test
	void a_passes(@ManagedResource(HttpServerFactory.class) HttpServer server) throws Exception {
		System.out.println("[demo] test a_passes uses server :" + server.getAddress().getPort());
		assertEquals("OK", Http.health(server));
	}

	@Test
	void b_fails(@ManagedResource(HttpServerFactory.class) HttpServer server) throws Exception {
		System.out.println("[demo] test b_fails uses server :" + server.getAddress().getPort());
		assertEquals("NOT OK", Http.health(server), "deliberate failure");
	}

	@AfterEach
	void afterEach() {
		System.out.println("[demo] @AfterEach");
	}
}
