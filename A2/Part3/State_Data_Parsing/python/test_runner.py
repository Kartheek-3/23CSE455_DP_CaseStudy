from state_parser_strategy import StateServer, AlertParser

server = StateServer(AlertParser())
assert server.process("sample-data") == "Parsed alert: sample-data"
print("PASS: Alert parser strategy delegation")
