class Trainer {
  constructor(name, specialization, currentClients, maxClients, rating, active = true) {
    Object.assign(this, { name, specialization, currentClients, maxClients, rating, active });
  }
}

class TrainerAssignmentPolicy {
  eligible(trainers) {
    return trainers.filter(t => t.active && t.currentClients < t.maxClients);
  }
}

class SpecializationMatchPolicy extends TrainerAssignmentPolicy {
  selectTrainer(trainers, memberGoal) {
    return this.eligible(trainers)
      .filter(t => t.specialization.toLowerCase() === memberGoal.toLowerCase())
      .sort((a, b) => b.rating - a.rating)[0] ?? null;
  }
}

class LeastLoadedPolicy extends TrainerAssignmentPolicy {
  selectTrainer(trainers) {
    return [...this.eligible(trainers)]
      .sort((a, b) => a.currentClients - b.currentClients || b.rating - a.rating)[0] ?? null;
  }
}

class HighestRatedPolicy extends TrainerAssignmentPolicy {
  selectTrainer(trainers) {
    return [...this.eligible(trainers)].sort((a, b) => b.rating - a.rating)[0] ?? null;
  }
}

class TrainerAssignmentService {
  constructor(policy) { this.policy = policy; }
  setPolicy(policy) { this.policy = policy; }
  assign(trainers, memberGoal) { return this.policy.selectTrainer(trainers, memberGoal); }
}

module.exports = {
  Trainer, TrainerAssignmentPolicy, SpecializationMatchPolicy,
  LeastLoadedPolicy, HighestRatedPolicy, TrainerAssignmentService
};
