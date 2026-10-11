const assert = require('node:assert/strict');
const {
  Trainer, SpecializationMatchPolicy, LeastLoadedPolicy,
  HighestRatedPolicy, TrainerAssignmentService
} = require('./trainerAssignment');

const trainers = [
  new Trainer('Asha', 'Weight Loss', 3, 10, 4.8),
  new Trainer('Ravi', 'Muscle Gain', 1, 10, 4.5),
  new Trainer('Maya', 'Weight Loss', 5, 10, 4.9),
  new Trainer('John', 'General Fitness', 0, 10, 5.0, false)
];

let service = new TrainerAssignmentService(new SpecializationMatchPolicy());
assert.equal(service.assign(trainers, 'Weight Loss').name, 'Maya');

service.setPolicy(new LeastLoadedPolicy());
assert.equal(service.assign(trainers, 'Any Goal').name, 'Ravi');

service.setPolicy(new HighestRatedPolicy());
assert.equal(service.assign(trainers, 'Any Goal').name, 'Maya');

assert.equal(service.assign([new Trainer('Full', 'Any', 2, 2, 5)], 'Any'), null);

console.log('All TrainerAssignmentStrategy tests passed.');
