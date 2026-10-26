#define ADAPTER_NO_MAIN
#include "adapter_example.cpp"
#include <cassert>

int main() {
    assert(result().asLine() == "status=APPROVED,amount_cents=2599,reference=legacy-25.99");
    std::cout << "Adapter tests passed: 1/1\n";
    return 0;
}
