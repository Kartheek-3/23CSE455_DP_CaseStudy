package resourcedemo;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import com.sun.net.httpserver.HttpServer;

final class Http {

	static String health(HttpServer server) throws Exception {
		var uri = URI.create("http://localhost:" + server.getAddress().getPort() + "/health");
		try (var client = HttpClient.newHttpClient()) {
			return client.send(HttpRequest.newBuilder(uri).build(), HttpResponse.BodyHandlers.ofString()).body();
		}
	}

	private Http() {
	}
}
