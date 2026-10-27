#pragma once
#include <memory>
#include <string>
#include <utility>
struct Transfer{std::string sender;int amount;};struct Check{std::unique_ptr<Check> next;explicit Check(std::unique_ptr<Check> n=nullptr):next(std::move(n)){}virtual bool allow(const Transfer&)=0;virtual~Check()=default;};
struct AmountCheck:Check{explicit AmountCheck(std::unique_ptr<Check> n=nullptr):Check(std::move(n)){}bool allow(const Transfer&t)override{return t.amount<=1000&&(!next||next->allow(t));}};struct DenyListCheck:Check{explicit DenyListCheck(std::unique_ptr<Check> n=nullptr):Check(std::move(n)){}bool allow(const Transfer&t)override{return t.sender!="blocked"&&(!next||next->allow(t));}};
inline bool demo(){DenyListCheck c{std::make_unique<AmountCheck>()};return c.allow({"a",10})&&!c.allow({"blocked",10});}

