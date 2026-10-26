#pragma once
#include <string>
#include <tuple>
#include <tuple>
struct TransferRequest{std::string sender,receiver;int amount;};inline auto toCommand(const TransferRequest& r){return std::make_tuple(r.sender,r.receiver,r.amount);}
inline bool demo(){return toCommand({"a","b",10})==std::make_tuple(std::string("a"),std::string("b"),10);}

