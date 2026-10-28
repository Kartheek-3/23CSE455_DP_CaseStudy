#pragma once
#include <map>
#include <string>
#include <vector>
struct Repository { std::map<std::string,int> balance{{"a",20},{"b",0}}; };
struct WalletFacade { Repository& repo; std::vector<std::string>& notices; void transfer(std::string s,std::string r,int a){repo.balance[s]-=a;repo.balance[r]+=a;notices.push_back("completed");} };
inline bool demo(){Repository r;std::vector<std::string> n;WalletFacade{r,n}.transfer("a","b",10);return r.balance["a"]==10&&r.balance["b"]==10&&n==std::vector<std::string>{"completed"};}

