namespace BankSystem.Services.Fraud
{
    using System;
    public interface ITransferRule
    {
        bool Allows(decimal amount, decimal balance);
    }
    public abstract class TransferRule : ITransferRule
    {
        private readonly ITransferRule next;
        protected TransferRule(ITransferRule next) { this.next = next; }
        protected abstract bool Accepts(decimal amount, decimal balance);
        public bool Allows(decimal amount, decimal balance)
            => Accepts(amount, balance) && (next == null || next.Allows(amount, balance));
    }
    public sealed class PositiveAmountRule : TransferRule
    {
        public PositiveAmountRule(ITransferRule next) : base(next) { }
        protected override bool Accepts(decimal amount, decimal balance) => amount > 0;
    }
    public sealed class SufficientFundsRule : TransferRule
    {
        public SufficientFundsRule(ITransferRule next) : base(next) { }
        protected override bool Accepts(decimal amount, decimal balance) => amount <= balance;
    }
    public sealed class HighValueRule : TransferRule
    {
        private readonly decimal limit;
        public HighValueRule(decimal limit, ITransferRule next = null) : base(next)
        {
            if (limit <= 0) throw new ArgumentOutOfRangeException(nameof(limit));
            this.limit = limit;
        }
        protected override bool Accepts(decimal amount, decimal balance) => amount <= limit;
    }
}
