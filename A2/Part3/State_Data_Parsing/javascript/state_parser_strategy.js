class AlertParser {
    parse(data) {
        return `Parsed alert: ${data}`;
    }
}

class LineParser {
    parse(data) {
        return `Parsed line: ${data}`;
    }
}

class RouteParser {
    parse(data) {
        return `Parsed route: ${data}`;
    }
}

class StateServer {
    constructor(parser) {
        this.parser = parser;
    }

    process(data) {
        return this.parser.parse(data);
    }
}

module.exports = {
    AlertParser,
    LineParser,
    RouteParser,
    StateServer
};
