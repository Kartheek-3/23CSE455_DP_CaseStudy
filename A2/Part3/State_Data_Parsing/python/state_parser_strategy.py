from abc import ABC, abstractmethod


class StateParser(ABC):
    @abstractmethod
    def parse(self, data: str) -> str:
        pass


class AlertParser(StateParser):
    def parse(self, data: str) -> str:
        return f"Parsed alert: {data}"


class LineParser(StateParser):
    def parse(self, data: str) -> str:
        return f"Parsed line: {data}"


class RouteParser(StateParser):
    def parse(self, data: str) -> str:
        return f"Parsed route: {data}"


class StateServer:
    def __init__(self, parser: StateParser):
        self.parser = parser

    def process(self, data: str) -> str:
        return self.parser.parse(data)


if __name__ == "__main__":
    server = StateServer(AlertParser())
    print(server.process("sample-data"))
