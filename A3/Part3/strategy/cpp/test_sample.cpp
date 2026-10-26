#include "sample.hpp"
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
std::string execute(std::string a,std::string b,std::string c){
    bool used=false;
    Totp totp([](std::string code){return code=="123456";});
    Recovery recovery([&](std::string code){if(code!="R-1"||used)return false;used=true;return true;});
    SecondFactor& chosen=a=="totp"?static_cast<SecondFactor&>(totp):static_cast<SecondFactor&>(recovery);
    Login login(chosen);std::string first=login.authenticate(b)?"ok":"fail";
    return first+":"+(login.authenticate(b)?"ok":"fail");
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
