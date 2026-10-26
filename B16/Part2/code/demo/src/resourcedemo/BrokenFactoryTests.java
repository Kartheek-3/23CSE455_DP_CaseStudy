package resourcedemo;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.support.ManagedResource;
import org.junit.jupiter.api.extension.support.ResourceFactory;

// Failure handling: a factory whose create() throws and one whose destroy() throws.
@TestMethodOrder(MethodOrderer.MethodName.class)
class BrokenFactoryTests {

	public static class CreateFails implements ResourceFactory<String> {
		@Override
		public String create(ExtensionContext context) {
			throw new IllegalStateException("database not reachable");
		}
	}

	public static class DestroyFails implements ResourceFactory<String> {
		@Override
		public String create(ExtensionContext context) {
			System.out.println("[demo]   create  connection");
			return "connection";
		}

		@Override
		public void destroy(String resource) {
			System.out.println("[demo]   destroy connection -> throws");
			throw new IllegalStateException("connection already closed");
		}
	}

	@Test
	void a_createFails(@ManagedResource(CreateFails.class) String connection) {
		System.out.println("[demo] never printed");
	}

	@Test
	void b_destroyFails(@ManagedResource(DestroyFails.class) String connection) {
		System.out.println("[demo] test b_destroyFails body passes");
	}
}
