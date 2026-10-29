#include "condition_strategy.hpp"

bool StateStrategy::evaluate(
    const ConditionData& data,
    const std::map<std::string, std::string>& stateStore,
    const std::map<std::string, int>& context
) const {
    auto it = stateStore.find(data.entity);
    if (it == stateStore.end()) return false;
    return it->second == data.expected;
}

bool NumericStrategy::evaluate(
    const ConditionData& data,
    const std::map<std::string, std::string>& stateStore,
    const std::map<std::string, int>& context
) const {
    auto it = stateStore.find(data.entity);
    if (it == stateStore.end()) return false;
    double val = 0.0;
    try {
        val = std::stod(it->second);
    } catch (...) {
        return false;
    }

    if (data.op == ">") return val > data.threshold;
    if (data.op == ">=") return val >= data.threshold;
    if (data.op == "<") return val < data.threshold;
    if (data.op == "<=") return val <= data.threshold;
    if (data.op == "==") return std::abs(val - data.threshold) < 1e-9;
    return false;
}

bool ScreenStrategy::evaluate(
    const ConditionData& data,
    const std::map<std::string, std::string>& stateStore,
    const std::map<std::string, int>& context
) const {
    auto it = context.find("screenWidth");
    int width = (it != context.end()) ? it->second : 0;
    return width >= data.minWidth && width <= data.maxWidth;
}

EvaluatorContext::EvaluatorContext() {
    registerStrategy("state", std::make_shared<StateStrategy>());
    registerStrategy("numeric", std::make_shared<NumericStrategy>());
    registerStrategy("screen", std::make_shared<ScreenStrategy>());
}

void EvaluatorContext::registerStrategy(const std::string& type, std::shared_ptr<ConditionStrategy> strategy) {
    if (strategy) {
        strategies[type] = std::move(strategy);
    }
}

bool EvaluatorContext::evaluate(
    const ConditionData& data,
    const std::map<std::string, std::string>& stateStore,
    const std::map<std::string, int>& context
) const {
    auto it = strategies.find(data.type);
    if (it == strategies.end()) return false;
    return it->second->evaluate(data, stateStore, context);
}
