package jakarta.ws.rs.core;
public class Response {
    public enum Status { OK(200), CREATED(201), BAD_REQUEST(400), NOT_FOUND(404);
        private final int code; Status(int c) { code = c; } public int getStatusCode() { return code; } }
    private final int status; private final Object entity;
    private Response(int s, Object e) { status = s; entity = e; }
    public int getStatus() { return status; }
    public Object getEntity() { return entity; }
    public static ResponseBuilder status(Status s) { return new ResponseBuilder(s.getStatusCode()); }
    public static class ResponseBuilder {
        private final int s; private Object e;
        ResponseBuilder(int s) { this.s = s; }
        public ResponseBuilder entity(Object o) { this.e = o; return this; }
        public Response build() { return new Response(s, e); }
    }
}
