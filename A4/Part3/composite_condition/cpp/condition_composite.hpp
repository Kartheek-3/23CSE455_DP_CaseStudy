#ifndef CONDITION_COMPOSITE_HPP
#define CONDITION_COMPOSITE_HPP

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <cmath>

class ConditionComposite {
public:
    virtual ~ConditionComposite() = default;
    virtual bool evaluate(const std::map<std::string, std::string>& stateStore) const = 0;
};

class StateCondition : public ConditionComposite {
private:
    std::string entityId;
    std::string expectedState;
public:
    StateCondition(std::string entityId, std::string expectedState);
    bool evaluate(const std::map<std::string, std::string>& stateStore) const override;
};

class NumericStateCondition : public ConditionComposite {
private:
    std::string entityId;
    std::string op;
    double threshold;
public:
    NumericStateCondition(std::string entityId, std::string op, double threshold);
    bool evaluate(const std::map<std::string, std::string>& stateStore) const override;
};

class AndCondition : public ConditionComposite {
private:
    std::vector<std::shared_ptr<ConditionComposite>> children;
public:
    AndCondition& add(std::shared_ptr<ConditionComposite> child);
    bool evaluate(const std::map<std::string, std::string>& stateStore) const override;
};

class OrCondition : public ConditionComposite {
private:
    std::vector<std::shared_ptr<ConditionComposite>> children;
public:
    OrCondition& add(std::shared_ptr<ConditionComposite> child);
    bool evaluate(const std::map<std::string, std::string>& stateStore) const override;
};

class NotCondition : public ConditionComposite {
private:
    std::shared_ptr<ConditionComposite> child;
public:
    explicit NotCondition(std::shared_ptr<ConditionComposite> child);
    bool evaluate(const std::map<std::string, std::string>& stateStore) const override;
};

#endif // CONDITION_COMPOSITE_HPP
