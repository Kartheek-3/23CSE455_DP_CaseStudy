#include "sample.hpp"
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
std::string execute(std::string a,std::string b,std::string c){
    struct Memory:Store {
        Account account;bool exists;
        Memory(long long b,bool e):account{b},exists(e){}
        Account* load()override{return exists?&account:nullptr;}
        void save(Account& value)override{account=value;}
    }store(std::stoll(a),c=="yes");
    int notices=0;PostingService(store,[&](){++notices;}).post(std::stoll(b));
    return (store.exists?std::to_string(store.account.balance):"missing")+":"+std::to_string(notices);
}
int main(int argc,char**argv){
    if(argc!=2)return 2;
    std::ifstream file(argv[1]);if(!file)return 3;
    std::string line;int count=0;
    while(std::getline(file,line)){
        std::stringstream ss(line);std::vector<std::string> f;std::string v;
        while(std::getline(ss,v,'\t'))f.push_back(v);
        if(f.size()!=4)return 4;
        auto actual=execute(f[0],f[1],f[2]);
        if(actual!=f[3]){std::cerr<<line<<" actual="<<actual;return 1;}
        ++count;
    }
    std::cout<<"PASS "<<count<<"/"<<count<<"\n";
}
