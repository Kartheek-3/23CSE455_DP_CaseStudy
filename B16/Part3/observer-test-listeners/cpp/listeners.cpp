#include "listeners.hpp"

#include <sstream>
#include <initializer_list>
#include <stdexcept>
#include <utility>

std::string to_string(Status status) {
    switch (status) {
        case Status::Successful: return "SUCCESSFUL";
        case Status::Failed: return "FAILED";
        case Status::Aborted: return "ABORTED";
    }
    return "?";
}

void CompositeTestExecutionListener::register_listener(std::shared_ptr<TestExecutionListener> listener) {
    listeners_.push_back(std::move(listener));
}

void CompositeTestExecutionListener::execution_started(const std::string& test_id) {
    notify_each("started " + test_id, [&](TestExecutionListener& l) { l.execution_started(test_id); });
}

void CompositeTestExecutionListener::execution_skipped(const std::string& test_id, const std::string& reason) {
    notify_each("skipped " + test_id, [&](TestExecutionListener& l) { l.execution_skipped(test_id, reason); });
}

void CompositeTestExecutionListener::execution_finished(const std::string& test_id, Status status) {
    notify_each("finished " + test_id, [&](TestExecutionListener& l) { l.execution_finished(test_id, status); });
}

void CompositeTestExecutionListener::notify_each(const std::string& event,
                                                 const std::function<void(TestExecutionListener&)>& call) {
    for (const auto& listener : listeners_) {
        try {
            call(*listener);
        } catch (const std::exception& e) {
            failures_.push_back(listener->name() + " failed on " + event + ": " + e.what());
        }
    }
}

void SummaryListener::execution_skipped(const std::string&, const std::string&) {
    ++skipped_;
}

void SummaryListener::execution_finished(const std::string&, Status status) {
    ++counts_[status];
}

std::string SummaryListener::render() const {
    std::ostringstream lines;
    int total = skipped_;
    for (Status status : {Status::Successful, Status::Failed, Status::Aborted}) {
        auto found = counts_.find(status);
        int count = found == counts_.end() ? 0 : found->second;
        total += count;
        lines << to_string(status) << ": " << count << '\n';
    }
    lines << "SKIPPED: " << skipped_ << '\n';
    return "total: " + std::to_string(total) + "\n" + lines.str();
}

void LoggingListener::execution_started(const std::string& test_id) {
    lines_.push_back("started " + test_id);
}

void LoggingListener::execution_skipped(const std::string& test_id, const std::string& reason) {
    lines_.push_back("skipped " + test_id + " (" + reason + ")");
}

void LoggingListener::execution_finished(const std::string& test_id, Status status) {
    lines_.push_back("finished " + test_id + " " + to_string(status));
}

std::string LoggingListener::render() const {
    std::ostringstream out;
    for (std::size_t i = 0; i < lines_.size(); ++i) {
        out << i + 1 << ". " << lines_[i] << '\n';
    }
    return out.str();
}

void BrokenListener::execution_started(const std::string&) {
    throw std::runtime_error("listener is broken");
}

void BrokenListener::execution_skipped(const std::string&, const std::string&) {
    throw std::runtime_error("listener is broken");
}

void BrokenListener::execution_finished(const std::string&, Status) {
    throw std::runtime_error("listener is broken");
}
