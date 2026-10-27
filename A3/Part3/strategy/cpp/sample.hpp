#pragma once
#include <functional>
#include <string>
struct SecondFactor {virtual bool authenticate(const std::string&)=0;virtual ~SecondFactor()=default;};
class Totp:public SecondFactor {
    std::function<bool(std::string)> provider;
public:
    explicit Totp(std::function<bool(std::string)> p):provider(p){}
    bool authenticate(const std::string& code)override{return provider(code);}
};
class Recovery:public SecondFactor {
    std::function<bool(std::string)> provider;
public:
    explicit Recovery(std::function<bool(std::string)> p):provider(p){}
    bool authenticate(const std::string& code)override{return provider(code);}
};
class Login {
    SecondFactor& strategy;
public:
    explicit Login(SecondFactor& s):strategy(s){}
    bool authenticate(const std::string& code){return strategy.authenticate(code);}
};
