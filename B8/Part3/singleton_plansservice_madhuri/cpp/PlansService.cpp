#include <cassert>
#include <iostream>
class PlansService {
 PlansService()=default;
public:
 PlansService(const PlansService&)=delete;
 static PlansService& getInstance(){static PlansService instance; return instance;}
};
int main(){assert(&PlansService::getInstance()==&PlansService::getInstance()); std::cout<<"PlansService Singleton test passed\\n";}
