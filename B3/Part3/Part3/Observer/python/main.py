
from abc import ABC, abstractmethod


class JobObserver(ABC):
    @abstractmethod
    def on_job_created(self, job_title: str) -> None:
        pass


class EmailNotifier(JobObserver):
    def on_job_created(self, job_title: str) -> None:
        print(f"Email notification: {job_title}")


class AnalyticsTracker(JobObserver):
    def on_job_created(self, job_title: str) -> None:
        print(f"Analytics recorded: {job_title}")


class JobService:
    def __init__(self):
        self.observers: list[JobObserver] = []

    def add_observer(self, observer: JobObserver) -> None:
        self.observers.append(observer)

    def create_job(self, job_title: str) -> None:
        print(f"Job created: {job_title}")
        self.notify_observers(job_title)

    def notify_observers(self, job_title: str) -> None:
        for observer in self.observers:
            observer.on_job_created(job_title)


if __name__ == "__main__":
    service = JobService()
    service.add_observer(EmailNotifier())
    service.add_observer(AnalyticsTracker())
    service.create_job("Python Developer")
