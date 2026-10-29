from collections import namedtuple

Job = namedtuple("Job", "id label to body")
JobResult = namedtuple("JobResult", "id label result attempts")


class JobQueue:
    def __init__(self, max_attempts=12):
        self._jobs = []
        self._next_id = 1
        self._max_attempts = max_attempts

    def add(self, label, to, body):
        job = Job(self._next_id, label, to, body)
        self._next_id += 1
        self._jobs.append(job)
        return job.id

    def run(self, processor):
        # The worker: takes jobs in FIFO order and retries a failing job up to max_attempts times.
        results = []
        while self._jobs:
            job = self._jobs.pop(0)
            result, attempts = None, 0
            while result is None and attempts < self._max_attempts:
                attempts += 1
                try:
                    result = processor(job)
                except RuntimeError:
                    pass
            results.append(JobResult(job.id, job.label, result or "failed", attempts))
        return results


class DeliverService:
    def __init__(self, queue):
        self._queue = queue

    def deliver(self, to, body):
        label = to.replace("https://", "").replace("/inbox", "")
        return self._queue.add(label, to, body)


class DeliverProcessor:
    def __init__(self, blocked_hosts, transport):
        self._blocked_hosts = blocked_hosts
        self._transport = transport

    def process(self, job):
        host = job.to.split("/")[2]
        if host in self._blocked_hosts:
            return "skip (blocked)"
        self._transport.send(job.to, job.body)
        return "delivered"
