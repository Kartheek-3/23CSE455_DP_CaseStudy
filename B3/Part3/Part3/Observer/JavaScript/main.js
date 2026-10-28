
class EmailNotifier {
    onJobCreated(jobTitle) {
        console.log(`Email notification: ${jobTitle}`);
    }
}

class AnalyticsTracker {
    onJobCreated(jobTitle) {
        console.log(`Analytics recorded: ${jobTitle}`);
    }
}

class JobService {
    constructor() {
        this.observers = [];
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    createJob(jobTitle) {
        console.log(`Job created: ${jobTitle}`);
        this.notifyObservers(jobTitle);
    }

    notifyObservers(jobTitle) {
        for (const observer of this.observers) {
            observer.onJobCreated(jobTitle);
        }
    }
}

if (require.main === module) {
    const service = new JobService();
    service.addObserver(new EmailNotifier());
    service.addObserver(new AnalyticsTracker());
    service.createJob("Python Developer");
}

module.exports = { JobService, EmailNotifier, AnalyticsTracker };
