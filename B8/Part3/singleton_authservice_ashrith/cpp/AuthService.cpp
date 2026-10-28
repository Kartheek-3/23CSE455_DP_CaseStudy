#include <cassert>
#include <iostream>
class AuthService {
 AuthService()=default;
public:
 AuthService(const AuthService&)=delete;
 static AuthService& getInstance(){static AuthService instance; return instance;}
};
int main(){assert(&AuthService::getInstance()==&AuthService::getInstance()); std::cout<<"AuthService Singleton test passed\\n";}
