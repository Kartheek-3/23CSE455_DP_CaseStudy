#pragma once
#include <functional>
#include <map>
#include <string>
#include <stdexcept>
class EmailAdapter {
    std::function<int(std::map<std::string,std::string>)> vendor;
public:
    explicit EmailAdapter(std::function<int(std::map<std::string,std::string>)> v):vendor(v) {}
    std::string send(const std::string& receiver,const std::string& message) {
        try{return vendor({{"to",receiver},{"html",message}})==202?"sent":"failed";}
        catch(const std::runtime_error&){return "failed";}
    }
};
