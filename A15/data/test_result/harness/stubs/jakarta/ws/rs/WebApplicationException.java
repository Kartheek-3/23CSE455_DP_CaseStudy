package jakarta.ws.rs;
import jakarta.ws.rs.core.Response;
public class WebApplicationException extends RuntimeException {
    private final Response response;
    public WebApplicationException(Response response) { super("HTTP " + response.getStatus()); this.response = response; }
    public Response getResponse() { return response; }
}
