class JobQueue {
  constructor(maxAttempts = 12) {
    this.jobs = [];
    this.nextId = 1;
    this.maxAttempts = maxAttempts;
  }

  add(label, to, body) {
    const job = { id: this.nextId++, label, to, body };
    this.jobs.push(job);
    return job.id;
  }

  // The worker: takes jobs in FIFO order and retries a failing job up to maxAttempts times.
  run(processor) {
    const results = [];
    while (this.jobs.length > 0) {
      const job = this.jobs.shift();
      let result = null;
      let attempts = 0;
      while (result === null && attempts < this.maxAttempts) {
        attempts++;
        try {
          result = processor(job);
        } catch (e) {
          // failed attempt, try again
        }
      }
      results.push({ id: job.id, label: job.label, result: result ?? 'failed', attempts });
    }
    return results;
  }
}

class DeliverService {
  constructor(queue) { this.queue = queue; }

  deliver(to, body) {
    const label = to.replace('https://', '').replace('/inbox', '');
    return this.queue.add(label, to, body);
  }
}

class DeliverProcessor {
  constructor(blockedHosts, transport) {
    this.blockedHosts = blockedHosts;
    this.transport = transport;
  }

  process(job) {
    const host = job.to.split('/')[2];
    if (this.blockedHosts.has(host)) return 'skip (blocked)';
    this.transport.send(job.to, job.body);
    return 'delivered';
  }
}

module.exports = { JobQueue, DeliverService, DeliverProcessor };
