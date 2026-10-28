#pragma once
#include <stdexcept>
#include <string>
struct Transfer { std::string sender, receiver; int amount; };
struct TransferBuilder { std::string sender, receiver; int amount=0;
  TransferBuilder& from(std::string s) { sender=s; return *this; } TransferBuilder& to(std::string r) { receiver=r; return *this; }
  TransferBuilder& forAmount(int a) { amount=a; return *this; }
  Transfer build() const { if(sender.empty() || receiver.empty() || !amount) throw std::invalid_argument("missing field"); return {sender,receiver,amount}; }
};
inline bool demo() { auto t=TransferBuilder{}.from("a").to("b").forAmount(10).build(); return t.sender=="a" && t.receiver=="b" && t.amount==10; }

