
#include <iostream>
#include <vector>
#include <string>
#include <cassert>
using namespace std;

// Observer Interface
class JobObserver {
public:
    virtual void on_job_created(const string& job_title) = 0;
    virtual ~JobObserver() = default;
};

// Subject
class JobService {
private:
    vector<JobObserver*> observers;

public:
    void add_observer(JobObserver* observer) {
        observers.push_back(observer);
    }

    void notify_observers(const string& job_title) {
        for (JobObserver* observer : observers) {
            observer->on_job_created(job_title);
        }
    }
};

// Test Observer
class TestObserver : public JobObserver {
public:
    vector<string> received_jobs;

    void on_job_created(const string& job_title) override {
        received_jobs.push_back(job_title);
    }
};

// Test 1: Single Observer
void test_single_observer() {
    JobService service;
    TestObserver observer;

    service.add_observer(&observer);
    service.notify_observers("Python Developer");

    assert(observer.received_jobs.size() == 1);
    assert(observer.received_jobs[0] == "Python Developer");

    cout << "PASS: Single observer" << endl;
}

// Test 2: Multiple Observers
void test_multiple_observers() {
    JobService service;
    TestObserver first;
    TestObserver second;

    service.add_observer(&first);
    service.add_observer(&second);
    service.notify_observers("Java Developer");

    assert(first.received_jobs.size() == 1);
    assert(first.received_jobs[0] == "Java Developer");

    assert(second.received_jobs.size() == 1);
    assert(second.received_jobs[0] == "Java Developer");

    cout << "PASS: Multiple observers" << endl;
}

// Test 3: No Observers
void test_no_observers() {
    JobService service;

    // Should work without errors when no observers exist
    service.notify_observers("Data Engineer");

    cout << "PASS: No observers" << endl;
}

// Main Function
int main() {
    test_single_observer();
    test_multiple_observers();
    test_no_observers();

    cout << "All Observer tests passed." << endl;

    return 0;
}
