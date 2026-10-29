#pragma once
#include <stdexcept>
#include <string>
struct VendorFx{double quote(const std::string& pair){if(pair!="USDEUR")throw std::invalid_argument("pair");return .92;}};struct RateProvider{VendorFx& vendor;double rate(std::string s,std::string t){return vendor.quote(s+t);}};
inline bool demo(){VendorFx v;return RateProvider{v}.rate("USD","EUR")==.92;}

