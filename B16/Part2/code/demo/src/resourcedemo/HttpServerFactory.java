package resourcedemo;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

import com.sun.net.httpserver.HttpServer;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.support.ResourceFactory;

// A real resource: the JDK's HTTP server on a free port, answering /health with "OK".
public class HttpServerFactory implements ResourceFactory<HttpServer> {

	@Override
	public HttpServer create(ExtensionContext context) throws Exception {
		HttpServer server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
		server.createContext("/health", exchange -> {
			byte[] body = "OK".getBytes(StandardCharsets.UTF_8);
			exchange.sendResponseHeaders(200, body.length);
			exchange.getResponseBody().write(body);
			exchange.close();
		});
		server.start();
		System.out.println("[demo]   create  server :" + server.getAddress().getPort() + "  (requested in "
				+ context.getDisplayName() + ")");
		return server;
	}

	@Override
	public void destroy(HttpServer server) {
		server.stop(0);
		System.out.println("[demo]   destroy server :" + server.getAddress().getPort());
	}
}
