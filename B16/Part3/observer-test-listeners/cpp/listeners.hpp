// Observer side: the abstract listener, the composite that notifies each one, and three listeners.
#pragma once

#include <functional>
#include <map>
#include <memory>
#include <string>
#include <vector>

enum class Status { Successful, Failed, Aborted };

std::string to_string(Status status);

// Abstract observer, modelled on JUnit's TestExecutionListener. The callbacks have
// empty default bodies; only name() must be overridden, because C++ has no portable
// way to get a readable class name at run time.
class TestExecutionListener {
public:
    virtual ~TestExecutionListener() = default;

    virtual std::string name() const = 0;
    virtual void execution_started(const std::string& /*test_id*/) {}
    virtual void execution_skipped(const std::string& /*test_id*/, const std::string& /*reason*/) {}
    virtual void execution_finished(const std::string& /*test_id*/, Status /*status*/) {}
};

// Forwards each event to every registered listener. Like JUnit's
// CompositeTestExecutionListener::notifyEach, a listener that throws is recorded in
// failures() and the remaining listeners still get the event. Listeners are held by
// shared_ptr because the caller usually keeps a handle to read results afterwards.
class CompositeTestExecutionListener final : public TestExecutionListener {
public:
    void register_listener(std::shared_ptr<TestExecutionListener> listener);
    const std::vector<std::string>& failures() const { return failures_; }

    std::string name() const override { return "CompositeTestExecutionListener"; }
    void execution_started(const std::string& test_id) override;
    void execution_skipped(const std::string& test_id, const std::string& reason) override;
    void execution_finished(const std::string& test_id, Status status) override;

private:
    void notify_each(const std::string& event, const std::function<void(TestExecutionListener&)>& call);

    std::vector<std::shared_ptr<TestExecutionListener>> listeners_;
    std::vector<std::string> failures_;
};

// Counts results per status.
class SummaryListener final : public TestExecutionListener {
public:
    std::string name() const override { return "SummaryListener"; }
    void execution_skipped(const std::string& test_id, const std::string& reason) override;
    void execution_finished(const std::string& test_id, Status status) override;
    std::string render() const;

private:
    std::map<Status, int> counts_;
    int skipped_ = 0;
};

// Writes one log line per event.
class LoggingListener final : public TestExecutionListener {
public:
    std::string name() const override { return "LoggingListener"; }
    void execution_started(const std::string& test_id) override;
    void execution_skipped(const std::string& test_id, const std::string& reason) override;
    void execution_finished(const std::string& test_id, Status status) override;
    std::string render() const;

private:
    std::vector<std::string> lines_;
};

// Throws on every event, to show the others are not affected.
class BrokenListener final : public TestExecutionListener {
public:
    std::string name() const override { return "BrokenListener"; }
    void execution_started(const std::string& test_id) override;
    void execution_skipped(const std::string& test_id, const std::string& reason) override;
    void execution_finished(const std::string& test_id, Status status) override;
};
