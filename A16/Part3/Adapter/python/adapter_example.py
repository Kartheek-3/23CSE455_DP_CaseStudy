from dataclasses import dataclass


@dataclass(frozen=True)
class PaymentReceipt:
    status: str
    amount_cents: int
    reference: str

    def as_line(self) -> str:
        return f"status={self.status},amount_cents={self.amount_cents},reference={self.reference}"


class LegacyGateway:
    def authorize(self, amount_dollars: float) -> str:
        return f"legacy-{amount_dollars:.2f}"


class LegacyGatewayAdapter:
    def __init__(self, gateway):
        self.gateway = gateway

    def charge(self, amount_cents: int) -> PaymentReceipt:
        reference = self.gateway.authorize(amount_cents / 100)
        return PaymentReceipt("APPROVED", amount_cents, reference)


def result() -> PaymentReceipt:
    return LegacyGatewayAdapter(LegacyGateway()).charge(2599)


if __name__ == "__main__":
    print(result().as_line())
