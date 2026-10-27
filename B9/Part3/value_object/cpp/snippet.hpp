#pragma once
#include <stdexcept>
#include <string>
struct Money{const int amount;const std::string currency;Money(int a,std::string c):amount(a),currency(c){if(a<0||c.empty())throw std::invalid_argument("invalid money");}bool operator==(const Money& o)const{return amount==o.amount&&currency==o.currency;}};
inline bool demo(){return Money(10,"EUR")==Money(10,"EUR")&&!(Money(10,"EUR")==Money(10,"USD"));}

