namespace BankSystem.Services.MoneyTransfer
{
    using System;
    using System.Data;
    using System.Threading.Tasks;
    using BankSystem.Data;
    using BankSystem.Models;
    using BankSystem.Common.EmailSender.Interface;
    using Microsoft.EntityFrameworkCore;

    public sealed class InternalTransferService : IInternalTransferService
    {
        private readonly BankSystemDbContext context;
        private readonly IEmailSender emails;
        public InternalTransferService(BankSystemDbContext context, IEmailSender emails)
        { this.context = context; this.emails = emails; }

        public async Task<bool> ExecuteAsync(InternalTransferRequest request)
        {
            if (request == null || request.Amount <= 0 || decimal.Round(request.Amount, 2) != request.Amount
                || string.IsNullOrWhiteSpace(request.UserId) || string.IsNullOrWhiteSpace(request.AccountId)
                || string.IsNullOrWhiteSpace(request.DestinationUniqueId)
                || (request.Kind != "Transfer" && request.Kind != "BillPayment")
                || (request.Description != null && request.Description.Length > BankSystem.Common.ModelConstants.MoneyTransfer.DescriptionMaxLength)) return false;

            // Serializable isolation protects the read/check/write sequence on a relational provider.
            using (var transaction = await context.Database.BeginTransactionAsync(IsolationLevel.Serializable))
            {
                var source = await context.Accounts.Include(a => a.User)
                    .SingleOrDefaultAsync(a => a.Id == request.AccountId);
                var destination = await context.Accounts.Include(a => a.User)
                    .SingleOrDefaultAsync(a => a.UniqueId == request.DestinationUniqueId);
                if (source == null || destination == null || source.Id == destination.Id
                    || source.UserId != request.UserId || source.Balance < request.Amount) return false;

                var reference = Guid.NewGuid().ToString("N");
                var now = DateTime.UtcNow;
                source.Balance -= request.Amount;
                destination.Balance += request.Amount;
                context.Transfers.Add(CreateEntry(source, source, destination, -request.Amount, request, reference, now));
                context.Transfers.Add(CreateEntry(destination, source, destination, request.Amount, request, reference, now));
                await context.SaveChangesAsync();
                await transaction.CommitAsync();
                // Delivery failure must not cause a committed payment to appear failed.
                try
                {
                    await emails.SendEmailAsync(source.User.Email, "Payment recorded", "Reference: " + reference);
                    await emails.SendEmailAsync(destination.User.Email, "Payment received", "Reference: " + reference);
                }
                catch { /* Durable delivery/outbox is outside this study. */ }
                return true;
            }
        }
        private static MoneyTransfer CreateEntry(BankAccount account, BankAccount source, BankAccount destination,
            decimal amount, InternalTransferRequest request, string reference, DateTime now)
        {
            return new MoneyTransfer
            {
                AccountId = account.Id, Account = account, Source = source.UniqueId,
                Destination = destination.UniqueId, SenderName = source.User.FullName,
                RecipientName = destination.User.FullName, Amount = amount, MadeOn = now,
                ReferenceNumber = reference, Description = request.Description, TransactionType = request.Kind
            };
        }
    }
}
