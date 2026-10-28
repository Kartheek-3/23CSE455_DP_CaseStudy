#pragma once
#include <deque>
#include <functional>
#include <optional>
#include <set>
#include <stdexcept>
#include <string>
#include <vector>

struct Job {
    int id;
    std::string label;
    std::string to;
    std::string body;
};

struct JobResult {
    int id;
    std::string label;
    std::string result;
    int attempts;
};

class Transport {
public:
    virtual ~Transport() = default;
    virtual void send(const std::string& to, const std::string& body) = 0;
};

class JobQueue {
public:
    explicit JobQueue(int maxAttempts = 12) : maxAttempts_(maxAttempts) {}

    int add(const std::string& label, const std::string& to, const std::string& body) {
        jobs_.push_back({nextId_++, label, to, body});
        return jobs_.back().id;
    }

    // The worker: takes jobs in FIFO order and retries a failing job up to maxAttempts times.
    std::vector<JobResult> run(const std::function<std::string(const Job&)>& processor) {
        std::vector<JobResult> results;
        while (!jobs_.empty()) {
            Job job = jobs_.front();
            jobs_.pop_front();
            std::optional<std::string> result;
            int attempts = 0;
            while (!result && attempts < maxAttempts_) {
                ++attempts;
                try {
                    result = processor(job);
                } catch (const std::runtime_error&) {
                    // failed attempt, try again
                }
            }
            results.push_back({job.id, job.label, result.value_or("failed"), attempts});
        }
        return results;
    }

private:
    std::deque<Job> jobs_;
    int maxAttempts_;
    int nextId_ = 1;
};

class DeliverService {
public:
    explicit DeliverService(JobQueue& queue) : queue_(queue) {}

    int deliver(const std::string& to, const std::string& body) {
        std::string label = to;
        for (const std::string part : {"https://", "/inbox"}) {
            auto pos = label.find(part);
            if (pos != std::string::npos) label.erase(pos, part.size());
        }
        return queue_.add(label, to, body);
    }

private:
    JobQueue& queue_;
};

class DeliverProcessor {
public:
    DeliverProcessor(const std::set<std::string>& blockedHosts, Transport& transport)
        : blockedHosts_(blockedHosts), transport_(transport) {}

    std::string process(const Job& job) {
        size_t start = job.to.find("//") + 2;
        std::string host = job.to.substr(start, job.to.find('/', start) - start);
        if (blockedHosts_.count(host)) return "skip (blocked)";
        transport_.send(job.to, job.body);
        return "delivered";
    }

private:
    const std::set<std::string>& blockedHosts_;
    Transport& transport_;
};
