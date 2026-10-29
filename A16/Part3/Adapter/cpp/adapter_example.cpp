#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

struct PaymentReceipt {
    std::string status;
    int amountCents;
    std::string reference;
    std::string asLine() const {
        return "status=" + status + ",amount_cents=" + std::to_string(amountCents) + ",reference=" + reference;
    }
};

class PaymentProvider {
public:
    virtual ~PaymentProvider() = default;
    virtual PaymentReceipt charge(int amountCents) const = 0;
};

class LegacyGateway {
public:
    std::string authorize(double amountDollars) const {
        std::ostringstream value;
        value << "legacy-" << std::fixed << std::setprecision(2) << amountDollars;
        return value.str();
    }
};

class LegacyGatewayAdapter : public PaymentProvider {
    const LegacyGateway& gateway;
public:
    explicit LegacyGatewayAdapter(const LegacyGateway& value) : gateway(value) {}
    PaymentReceipt charge(int amountCents) const override {
        return {"APPROVED", amountCents, gateway.authorize(amountCents / 100.0)};
    }
};

PaymentReceipt result() {
    LegacyGateway gateway;
    return LegacyGatewayAdapter(gateway).charge(2599);
}

#ifndef ADAPTER_NO_MAIN
int main() {
    std::cout << result().asLine() << '\n';
    return 0;
}
#endif
