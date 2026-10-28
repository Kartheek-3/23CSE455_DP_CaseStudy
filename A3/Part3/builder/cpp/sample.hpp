#pragma once
#include <map>
#include <string>
#include <stdexcept>
class HeaderBuilder {
    std::map<std::string,std::string> headers;
public:
    HeaderBuilder& add(const std::string& key,const std::string& value) {
        if(key.empty())throw std::invalid_argument("key required");
        headers[key]=value;
        return *this;
    }
    HeaderBuilder& remove(const std::string& key){headers.erase(key);return *this;}
    std::map<std::string,std::string> build()const{return headers;}
};
