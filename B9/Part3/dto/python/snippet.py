from dataclasses import dataclass
@dataclass(frozen=True)
class TransferRequest:
    sender: str
    receiver: str
    amount: int
def to_command(request): return (request.sender, request.receiver, request.amount)
def demo(): return to_command(TransferRequest("a", "b", 10)) == ("a", "b", 10)

