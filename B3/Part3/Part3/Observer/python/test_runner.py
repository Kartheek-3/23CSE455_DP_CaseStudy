
from main import JobService, JobObserver


class TestObserver(JobObserver):
    def __init__(self):
        self.received_jobs = []

    def on_job_created(self, job_title: str) -> None:
        self.received_jobs.append(job_title)


def test_single_observer():
    service = JobService()
    observer = TestObserver()

    service.add_observer(observer)
    service.notify_observers("Python Developer")

    assert observer.received_jobs == ["Python Developer"]
    print("PASS: Single observer")


def test_multiple_observers():
    service = JobService()
    first = TestObserver()
    second = TestObserver()

    service.add_observer(first)
    service.add_observer(second)
    service.notify_observers("Java Developer")

    assert first.received_jobs == ["Java Developer"]
    assert second.received_jobs == ["Java Developer"]
    print("PASS: Multiple observers")


def test_no_observers():
    service = JobService()
    service.notify_observers("Data Engineer")

    print("PASS: No observers")


if __name__ == "__main__":
    test_single_observer()
    test_multiple_observers()
    test_no_observers()
    print("All Observer tests passed.")
