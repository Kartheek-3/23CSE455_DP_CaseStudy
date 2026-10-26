#ifndef CONDITION_STRATEGY_HPP
#define CONDITION_STRATEGY_HPP

#include <string>
#include <map>
#include <memory>
#include <cmath>

struct ConditionData {
    std::string type;
    std::string entity;
    std::string expected;
    std::string op;
    double threshold = 0.0;
    int minWidth = 0;
    int maxWidth = 1000000;
};

class ConditionStrategy {
public:
    virtual ~ConditionStrategy() = default;
    virtual bool evaluate(
        const ConditionData& data,
        const std::map<std::string, std::string>& stateStore,
        const std::map<std::string, int>& context
    ) const = 0;
};

class StateStrategy : public ConditionStrategy {
public:
    bool evaluate(
        const ConditionData& data,
        const std::map<std::string, std::string>& stateStore,
        const std::map<std::string, int>& context
    ) const override;
};

class NumericStrategy : public ConditionStrategy {
public:
    bool evaluate(
        const ConditionData& data,
        const std::map<std::string, std::string>& stateStore,
        const std::map<std::string, int>& context
    ) const override;
};

class ScreenStrategy : public ConditionStrategy {
public:
    bool evaluate(
        const ConditionData& data,
        const std::map<std::string, std::string>& stateStore,
        const std::map<std::string, int>& context
    ) const override;
};

class EvaluatorContext {
private:
    std::map<std::string, std::shared_ptr<ConditionStrategy>> strategies;
public:
    EvaluatorContext();
    void registerStrategy(const std::string& type, std::shared_ptr<ConditionStrategy> strategy);
    bool evaluate(
        const ConditionData& data,
        const std::map<std::string, std::string>& stateStore,
        const std::map<std::string, int>& context
    ) const;
};

#endif // CONDITION_STRATEGY_HPP
