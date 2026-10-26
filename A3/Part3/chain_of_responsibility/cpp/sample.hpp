#pragma once
#include <memory>
#include <stdexcept>
class Rule {
    std::unique_ptr<Rule> next;
protected:
    virtual bool accepts(long long,long long)const=0;
public:
    explicit Rule(std::unique_ptr<Rule> n=nullptr):next(std::move(n)){}
    virtual ~Rule()=default;
    bool allows(long long amount,long long balance)const {
        return accepts(amount,balance)&&(!next||next->allows(amount,balance));
    }
};
class Positive:public Rule {
public:using Rule::Rule;
protected:bool accepts(long long amount,long long)const override{return amount>0;}
};
class Funds:public Rule {
public:using Rule::Rule;
protected:bool accepts(long long amount,long long balance)const override{return amount<=balance;}
};
class HighValue:public Rule {
    long long limit;
public:
    explicit HighValue(long long value):limit(value){if(value<=0)throw std::invalid_argument("positive limit required");}
protected:bool accepts(long long amount,long long)const override{return amount<=limit;}
};
