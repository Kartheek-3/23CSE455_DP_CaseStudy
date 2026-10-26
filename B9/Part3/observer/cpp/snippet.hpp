#pragma once
#include <functional>
#include <string>
#include <vector>
struct Publisher { std::vector<std::function<void(std::string)>> all; void subscribe(std::function<void(std::string)> f){all.push_back(f);}void publish(std::string id){for(auto& f:all)f(id);} };
inline bool demo(){std::vector<std::string>s;Publisher p;p.subscribe([&](auto x){s.push_back("email:"+x);});p.subscribe([&](auto x){s.push_back("audit:"+x);});p.publish("t1");return s==std::vector<std::string>{"email:t1","audit:t1"};}

