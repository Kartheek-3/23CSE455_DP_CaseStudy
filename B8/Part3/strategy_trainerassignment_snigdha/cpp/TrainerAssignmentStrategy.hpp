#ifndef TRAINER_ASSIGNMENT_STRATEGY_HPP
#define TRAINER_ASSIGNMENT_STRATEGY_HPP

#include <algorithm>
#include <memory>
#include <string>
#include <vector>

struct Trainer {
    std::string name;
    std::string specialization;
    int currentClients;
    int maxClients;
    double rating;
    bool active = true;
};

class TrainerAssignmentPolicy {
public:
    virtual ~TrainerAssignmentPolicy() = default;
    virtual const Trainer* selectTrainer(
        const std::vector<Trainer>& trainers,
        const std::string& memberGoal) const = 0;

protected:
    static std::vector<const Trainer*> eligible(
        const std::vector<Trainer>& trainers) {
        std::vector<const Trainer*> result;
        for (const auto& trainer : trainers) {
            if (trainer.active && trainer.currentClients < trainer.maxClients)
                result.push_back(&trainer);
        }
        return result;
    }
};

class SpecializationMatchPolicy : public TrainerAssignmentPolicy {
public:
    const Trainer* selectTrainer(const std::vector<Trainer>& trainers,
                                 const std::string& memberGoal) const override {
        const Trainer* best = nullptr;
        for (const Trainer* t : eligible(trainers)) {
            if (t->specialization == memberGoal &&
                (!best || t->rating > best->rating)) best = t;
        }
        return best;
    }
};

class LeastLoadedPolicy : public TrainerAssignmentPolicy {
public:
    const Trainer* selectTrainer(const std::vector<Trainer>& trainers,
                                 const std::string&) const override {
        const Trainer* best = nullptr;
        for (const Trainer* t : eligible(trainers)) {
            if (!best || t->currentClients < best->currentClients ||
                (t->currentClients == best->currentClients && t->rating > best->rating))
                best = t;
        }
        return best;
    }
};

class HighestRatedPolicy : public TrainerAssignmentPolicy {
public:
    const Trainer* selectTrainer(const std::vector<Trainer>& trainers,
                                 const std::string&) const override {
        const Trainer* best = nullptr;
        for (const Trainer* t : eligible(trainers))
            if (!best || t->rating > best->rating) best = t;
        return best;
    }
};

class TrainerAssignmentService {
    std::unique_ptr<TrainerAssignmentPolicy> policy;
public:
    explicit TrainerAssignmentService(std::unique_ptr<TrainerAssignmentPolicy> p)
        : policy(std::move(p)) {}

    void setPolicy(std::unique_ptr<TrainerAssignmentPolicy> p) {
        policy = std::move(p);
    }

    const Trainer* assign(const std::vector<Trainer>& trainers,
                          const std::string& memberGoal) const {
        return policy->selectTrainer(trainers, memberGoal);
    }
};

#endif
