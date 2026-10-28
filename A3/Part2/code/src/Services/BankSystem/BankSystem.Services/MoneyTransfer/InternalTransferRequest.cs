namespace BankSystem.Services.MoneyTransfer
{
    public sealed class InternalTransferRequest
    {
        public string UserId { get; set; }
        public string AccountId { get; set; }
        public string DestinationUniqueId { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; }
        public string Kind { get; set; } = "Transfer";
    }
}
