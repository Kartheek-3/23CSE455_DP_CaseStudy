#include <iostream>
#include <memory>
#include <string>
using namespace std;

class StateParser {
public:
    virtual string parse(const string& data) = 0;
    virtual ~StateParser() = default;
};

class AlertParser : public StateParser {
public:
    string parse(const string& data) override {
        return "Parsed alert: " + data;
    }
};

class LineParser : public StateParser {
public:
    string parse(const string& data) override {
        return "Parsed line: " + data;
    }
};

class RouteParser : public StateParser {
public:
    string parse(const string& data) override {
        return "Parsed route: " + data;
    }
};

class StateServer {
private:
    unique_ptr<StateParser> parser;

public:
    explicit StateServer(unique_ptr<StateParser> p)
        : parser(move(p)) {}

    string process(const string& data) {
        return parser->parse(data);
    }
};

int main() {
    StateServer server(make_unique<AlertParser>());
    cout << server.process("sample-data") << endl;
    return 0;
}
