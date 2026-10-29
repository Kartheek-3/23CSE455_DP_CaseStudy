#pragma once
#include <string>
#include <vector>
struct Service{std::vector<std::string>& repository;std::vector<std::string>& notifier;void complete(std::string id){repository.push_back(id);notifier.push_back("sent:"+id);}};
inline bool demo(){std::vector<std::string>r,n;Service{r,n}.complete("t1");return r==std::vector<std::string>{"t1"}&&n==std::vector<std::string>{"sent:t1"};}

