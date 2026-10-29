#include "runner.hpp"

#include <fstream>
#include <initializer_list>
#include <memory>
#include <sstream>

namespace {

const std::string kReasonPrefix = "reason=";

Status parse_status(int line_number, const std::string& text) {
    for (Status status : {Status::Successful, Status::Failed, Status::Aborted}) {
        if (to_string(status) == text) return status;
    }
    throw EventFormatError(line_number, "unknown status '" + text + "'");
}

}  // namespace

void EventRunner::run(const std::vector<std::string>& lines) {
    for (std::size_t i = 0; i < lines.size(); ++i) {
        dispatch(static_cast<int>(i) + 1, lines[i]);
    }
}

void EventRunner::dispatch(int line_number, const std::string& line) {
    std::istringstream words(line);
    std::vector<std::string> fields;
    for (std::string word; words >> word;) fields.push_back(word);
    if (fields.empty() || fields[0].starts_with('#')) return;

    const std::string& event = fields[0];
    auto require = [&](bool condition) {
        if (!condition) throw EventFormatError(line_number, "malformed " + event + " event");
    };

    if (event == "started") {
        require(fields.size() == 2);
        listener_.execution_started(fields[1]);
    } else if (event == "finished") {
        require(fields.size() == 3);
        listener_.execution_finished(fields[1], parse_status(line_number, fields[2]));
    } else if (event == "skipped") {
        require(fields.size() >= 3 && fields[2].starts_with(kReasonPrefix));
        std::string reason = fields[2].substr(kReasonPrefix.size());
        for (std::size_t i = 3; i < fields.size(); ++i) reason += " " + fields[i];
        require(!reason.empty());
        listener_.execution_skipped(fields[1], reason);
    } else {
        throw EventFormatError(line_number, "unknown event '" + event + "'");
    }
}

std::vector<std::string> read_lines(const std::string& path) {
    std::ifstream in(path);
    if (!in) throw std::runtime_error("cannot open " + path);
    std::vector<std::string> lines;
    for (std::string line; std::getline(in, line);) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        lines.push_back(line);
    }
    return lines;
}

std::string report(const std::string& events_path) {
    auto summary = std::make_shared<SummaryListener>();
    auto log = std::make_shared<LoggingListener>();

    CompositeTestExecutionListener listeners;
    listeners.register_listener(summary);
    listeners.register_listener(std::make_shared<BrokenListener>());
    listeners.register_listener(log);

    EventRunner(listeners).run(read_lines(events_path));

    std::ostringstream out;
    out << "== Summary ==\n" << summary->render();
    out << "== Log ==\n" << log->render();
    out << "== Listener failures (" << listeners.failures().size() << ") ==\n";
    for (const auto& failure : listeners.failures()) out << failure << '\n';
    return out.str();
}
