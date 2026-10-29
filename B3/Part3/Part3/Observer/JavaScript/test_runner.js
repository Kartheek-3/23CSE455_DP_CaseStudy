
const assert = require("node:assert/strict");
const { JobService } = require("./main");

class TestObserver {
    constructor() {
        this.receivedJobs = [];
    }

    onJobCreated(jobTitle) {
        this.receivedJobs.push(jobTitle);
    }
}

function testSingleObserver() {
    const service = new JobService();
    const observer = new TestObserver();

    service.addObserver(observer);
    service.notifyObservers("Python Developer");

    assert.deepEqual(observer.receivedJobs, ["Python Developer"]);
    console.log("PASS: Single observer");
}

function testMultipleObservers() {
    const service = new JobService();
    const first = new TestObserver();
    const second = new TestObserver();

    service.addObserver(first);
    service.addObserver(second);
    service.notifyObservers("Java Developer");

    assert.deepEqual(first.receivedJobs, ["Java Developer"]);
    assert.deepEqual(second.receivedJobs, ["Java Developer"]);
    console.log("PASS: Multiple observers");
}

function testNoObservers() {
    const service = new JobService();
    service.notifyObservers("Data Engineer");

    console.log("PASS: No observers");
}

testSingleObserver();
testMultipleObservers();
testNoObservers();

console.log("All Observer tests passed.");
