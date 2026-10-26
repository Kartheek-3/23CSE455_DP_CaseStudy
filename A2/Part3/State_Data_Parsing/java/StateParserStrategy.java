interface StateParser {
    String parse(String data);
}

class AlertParser implements StateParser {
    public String parse(String data) {
        return "Parsed alert: " + data;
    }
}

class LineParser implements StateParser {
    public String parse(String data) {
        return "Parsed line: " + data;
    }
}

class RouteParser implements StateParser {
    public String parse(String data) {
        return "Parsed route: " + data;
    }
}

class StateServer {
    private final StateParser parser;

    StateServer(StateParser parser) {
        this.parser = parser;
    }

    String process(String data) {
        return parser.parse(data);
    }

    public static void main(String[] args) {
        StateServer server = new StateServer(new AlertParser());
        System.out.println(server.process("sample-data"));
    }
}
