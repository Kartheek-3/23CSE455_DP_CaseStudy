#pragma once
#include <cmath>
#include <memory>
#include <string>
struct Conversion{virtual double convert(double)=0;virtual~Conversion()=default;};struct FixedRate:Conversion{double convert(double a)override{return a*.92;}};struct SameCurrency:Conversion{double convert(double a)override{return a;}};
struct Factory{std::unique_ptr<Conversion> select(std::string s,std::string t){if(s==t)return std::make_unique<SameCurrency>();return std::make_unique<FixedRate>();}};
inline bool demo(){Factory f;return std::abs(f.select("USD","EUR")->convert(10)-9.2)<1e-9&&f.select("EUR","EUR")->convert(10)==10;}

