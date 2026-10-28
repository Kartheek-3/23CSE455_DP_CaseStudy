#include <functional>
#include <iostream>
#include <memory>
#include <cmath>
#include <stdexcept>
#include <string>
#include <vector>
struct Money { double amount; std::string currency; };
struct ConversionStrategy { virtual Money convert(Money m, const std::string& target)=0; virtual ~ConversionStrategy()=default; };
struct FixedRate : ConversionStrategy { Money convert(Money m, const std::string& t) override { return {m.amount*0.92,t}; } };
struct SameCurrency : ConversionStrategy { Money convert(Money m, const std::string& t) override { if(m.currency!=t) throw std::invalid_argument("currency mismatch"); return m; } };
struct ConversionFactory { std::unique_ptr<ConversionStrategy> select(const std::string& from,const std::string& to) { return from==to ? std::make_unique<SameCurrency>() : std::make_unique<FixedRate>(); } };
struct Publisher { std::vector<std::function<void(std::string)>> observers; void subscribe(std::function<void(std::string)> f) { observers.push_back(f); } void publish(const std::string& id) { for(auto& f:observers) f(id); } };
void check(bool condition) { if (!condition) throw std::runtime_error("fixture check failed"); }
int main(){
  ConversionFactory f;
  auto converted=f.select("USD","EUR")->convert({10,"USD"},"EUR");
  check(std::lround(converted.amount*100)==920 && converted.currency=="EUR");
  auto same=f.select("EUR","EUR")->convert({10,"EUR"},"EUR");
  check(same.amount==10 && same.currency=="EUR");
  std::vector<std::string> events; Publisher p;
  p.subscribe([&](auto id){events.push_back("email:"+id);});
  p.subscribe([&](auto id){events.push_back("audit:"+id);}); p.publish("t1");
  check(events.size()==2);
  check(events[0]=="email:t1" && events[1]=="audit:t1");
  std::cout<<"4/4 passed\n";
}
