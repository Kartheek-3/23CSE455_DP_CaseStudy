#include <deque>
#include <string>

struct Job {
    std::string type;
    std::string recipient;
    std::string payload;
};

class Producer {
private:
    std::deque<Job>& queue;

public:
    explicit Producer(std::deque<Job>& queue)
        : queue(queue) {}

    void enqueue(const Job& job) {
        queue.push_back(job);
    }
};

class Consumer {
private:
    std::deque<Job>& queue;

public:
    explicit Consumer(std::deque<Job>& queue)
        : queue(queue) {}

    std::string processNext() {
        if (queue.empty()) {
            return "";
        }

        Job job = queue.front();
        queue.pop_front();

        if (job.type == "SENDGRID") {
            return "SENDGRID email processed for " + job.recipient;
        }

        if (job.type == "MAILTRAP") {
            return "MAILTRAP email processed for " + job.recipient;
        }

        return "";
    }
};