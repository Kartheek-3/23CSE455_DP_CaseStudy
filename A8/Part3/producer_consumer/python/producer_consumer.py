from collections import deque
from dataclasses import dataclass


@dataclass
class Job:
    job_type: str
    recipient: str
    payload: str


class Producer:
    def __init__(self, queue):
        self.queue = queue

    def enqueue(self, job: Job):
        self.queue.append(job)


class Consumer:
    def __init__(self, queue):
        self.queue = queue

    def process_next(self):
        if not self.queue:
            return None

        job = self.queue.popleft()

        if job.job_type == "SENDGRID":
            return f"SENDGRID email processed for {job.recipient}"

        if job.job_type == "MAILTRAP":
            return f"MAILTRAP email processed for {job.recipient}"

        return None