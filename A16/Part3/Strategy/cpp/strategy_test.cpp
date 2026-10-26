#define main strategy_demo_main
#include "strategy_example.cpp"
#undef main
#include <cassert>

int main() {
    assert(standardResult() == 9000);
    assert(premiumResult() == 8000);
    std::cout << "Strategy tests passed: 2/2\n";
    return 0;
}
