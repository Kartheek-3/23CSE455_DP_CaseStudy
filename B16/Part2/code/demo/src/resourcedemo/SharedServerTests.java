package resourcedemo;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.sun.net.httpserver.HttpServer;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.support.ManagedResource;

// Class scope: the server is requested in @BeforeAll, so both tests share it and it is stopped after @AfterAll.
class SharedServerTests {

	@BeforeAll
	static void beforeAll(@ManagedResource(HttpServerFactory.class) HttpServer server) {
		System.out.println("[demo] @BeforeAll got server :" + server.getAddress().getPort());
	}

	@Test
	void healthCheck(@ManagedResource(HttpServerFactory.class) HttpServer server) throws Exception {
		System.out.println("[demo] test healthCheck uses server :" + server.getAddress().getPort());
		assertEquals("OK", Http.health(server));
	}

	@Test
	void secondCall(@ManagedResource(HttpServerFactory.class) HttpServer server) throws Exception {
		System.out.println("[demo] test secondCall uses server :" + server.getAddress().getPort());
		assertEquals("OK", Http.health(server));
	}

	@AfterAll
	static void afterAll() {
		System.out.println("[demo] @AfterAll");
	}
}
