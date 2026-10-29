#include <iostream>
#include <vector>
#include <string>
using namespace std;

// Observer Interface
class JobObserver {
public:
    virtual void on_job_created(const string& job_title) = 0;

    virtual ~JobObserver() = default;
};

// Concrete Observer 1
class EmailNotifier : public JobObserver {
public:
    void on_job_created(const string& job_title) override {
        cout << "Email notification: " << job_title << endl;
    }
};

// Concrete Observer 2
class AnalyticsTracker : public JobObserver {
public:
    void on_job_created(const string& job_title) override {
        cout << "Analytics recorded: " << job_title << endl;
    }
};

// Subject
class JobService {
private:
    vector<JobObserver*> observers;

public:
    void add_observer(JobObserver* observer) {
        observers.push_back(observer);
    }

    void create_job(const string& job_title) {
        cout << "Job created: " << job_title << endl;
        notify_observers(job_title);
    }

    void notify_observers(const string& job_title) {
        for (JobObserver* observer : observers) {
            observer->on_job_created(job_title);
        }
    }
};

// Main Function
int main() {
    JobService service;

    EmailNotifier emailNotifier;
    AnalyticsTracker analyticsTracker;

    service.add_observer(&emailNotifier);
    service.add_observer(&analyticsTracker);

    service.create_job("Python Developer");

    return 0;
}