#pragma once
#include <map>
#include <optional>
#include <string>
struct Wallet { std::string id; int balance; };
struct WalletRepository { std::map<std::string,Wallet> items; void save(Wallet w){items[w.id]=w;} std::optional<Wallet> find(const std::string& id) const {auto i=items.find(id);return i==items.end()?std::nullopt:std::optional<Wallet>{i->second};} };
inline bool demo(){WalletRepository r;r.save({"a",10});return r.find("a")->balance==10&&!r.find("missing");}

