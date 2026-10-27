class Job {
    constructor(type, recipient, payload) {
        this.type = type;
        this.recipient = recipient;
        this.payload = payload;
    }
}

class Producer {
    constructor(queue) {
        this.queue = queue;
    }

    enqueue(job) {
        this.queue.push(job);
    }
}

class Consumer {
    constructor(queue) {
        this.queue = queue;
    }

    processNext() {
        if (this.queue.length === 0) {
            return null;
        }

        const job = this.queue.shift();

        if (job.type === "SENDGRID") {
            return `SENDGRID email processed for ${job.recipient}`;
        }

        if (job.type === "MAILTRAP") {
            return `MAILTRAP email processed for ${job.recipient}`;
        }

        return null;
    }
}

module.exports = {
    Job,
    Producer,
    Consumer
};