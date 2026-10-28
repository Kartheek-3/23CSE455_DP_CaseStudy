#pragma once
#include <functional>
struct Account {long long balance;};
struct Store {
    virtual Account* load()=0;
    virtual void save(Account&)=0;
    virtual ~Store()=default;
};
class PostingService {
    Store& store;
    std::function<void()> sender;
public:
    PostingService(Store& s,std::function<void()> n):store(s),sender(n){}
    bool post(long long amount){
        auto account=store.load();
        if(!account)return false;
        account->balance+=amount;
        store.save(*account);
        sender();
        return true;
    }
};
