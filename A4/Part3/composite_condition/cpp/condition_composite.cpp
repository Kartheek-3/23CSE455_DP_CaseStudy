#include "condition_composite.hpp"
#include <sstream>

StateCondition::StateCondition(std::string entityId, std::string expectedState)
    : entityId(std::move(entityId)), expectedState(std::move(expectedState)) {}

bool StateCondition::evaluate(const std::map<std::string, std::string>& stateStore) const {
    auto it = stateStore.find(entityId);
    if (it == stateStore.end()) return false;
    return it->second == expectedState;
}

NumericStateCondition::NumericStateCondition(std::string entityId, std::string op, double threshold)
    : entityId(std::move(entityId)), op(std::move(op)), threshold(threshold) {}

bool NumericStateCondition::evaluate(const std::map<std::string, std::string>& stateStore) const {
    auto it = stateStore.find(entityId);
    if (it == stateStore.end()) return false;
    double val = 0.0;
    try {
        val = std::stod(it->second);
    } catch (...) {
        return false;
    }

    if (op == ">") return val > threshold;
    if (op == ">=") return val >= threshold;
    if (op == "<") return val < threshold;
    if (op == "<=") return val <= threshold;
    if (op == "==") return std::abs(val - threshold) < 1e-9;
    return false;
}

AndCondition& AndCondition::add(std::shared_ptr<ConditionComposite> child) {
    if (child) children.push_back(std::move(child));
    return *this;
}

bool AndCondition::evaluate(const std::map<std::string, std::string>& stateStore) const {
    if (children.empty()) return true;
    for (const auto& child : children) {
        if (!child->evaluate(stateStore)) return false;
    }
    return true;
}

OrCondition& OrCondition::add(std::shared_ptr<ConditionComposite> child) {
    if (child) children.push_back(std::move(child));
    return *this;
}

bool OrCondition::evaluate(const std::map<std::string, std::string>& stateStore) const {
    if (children.empty()) return false;
    for (const auto& child : children) {
        if (child->evaluate(stateStore)) return true;
    }
    return false;
}

NotCondition::NotCondition(std::shared_ptr<ConditionComposite> child)
    : child(std::move(child)) {}

bool NotCondition::evaluate(const std::map<std::string, std::string>& stateStore) const {
    if (!child) return true;
    return !child->evaluate(stateStore);
}
