namespace BankSystem.Web.Areas.MoneyTransfers.Controllers
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using Common;
    using Infrastructure;
    using Microsoft.AspNetCore.Mvc;
    using Models.Internal;
    using Services.BankAccount;
    using Services.Models.BankAccount;
    using Services.Models.MoneyTransfer;
    using Services.MoneyTransfer;

    public class InternalController : BaseMoneyTransferController
    {
        private readonly IBankAccountService bankAccountService;
        private readonly IInternalTransferService internalTransfers;
        
        public InternalController(
            IInternalTransferService internalTransfers,
            IBankAccountService bankAccountService,
            IMapper mapper)
            : base(bankAccountService, mapper)
        {
            this.internalTransfers = internalTransfers;
            this.bankAccountService = bankAccountService;
        }

        public async Task<IActionResult> Create()
        {
            var userId = this.GetCurrentUserId();
            var userAccounts = await this.GetAllAccountsAsync(userId);

            if (!userAccounts.Any())
            {
                this.ShowErrorMessage(NotificationMessages.NoAccountsError);

                return this.RedirectToHome();
            }

            var model = new InternalMoneyTransferCreateBindingModel
            {
                OwnAccounts = userAccounts
            };

            return this.View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Create(InternalMoneyTransferCreateBindingModel model)
        {
            var userId = this.GetCurrentUserId();

            if (!this.ModelState.IsValid)
            {
                model.OwnAccounts = await this.GetAllAccountsAsync(userId);

                return this.View(model);
            }

            var account = await this.bankAccountService.GetByIdAsync<BankAccountDetailsServiceModel>(model.AccountId);
            if (account == null || account.UserId != userId)
            {
                return this.Forbid();
            }

            if (string.Equals(account.UniqueId, model.DestinationBankAccountUniqueId,
                StringComparison.InvariantCulture))
            {
                this.ShowErrorMessage(NotificationMessages.SameAccountsError);
                model.OwnAccounts = await this.GetAllAccountsAsync(userId);

                return this.View(model);
            }

            if (account.Balance < model.Amount)
            {
                this.ShowErrorMessage(NotificationMessages.InsufficientFunds);
                model.OwnAccounts = await this.GetAllAccountsAsync(userId);

                return this.View(model);
            }

            var destinationAccount =
                await this.bankAccountService.GetByUniqueIdAsync<BankAccountConciseServiceModel>(
                    model.DestinationBankAccountUniqueId);
            if (destinationAccount == null)
            {
                this.ShowErrorMessage(NotificationMessages.DestinationBankAccountDoesNotExist);
                model.OwnAccounts = await this.GetAllAccountsAsync(userId);

                return this.View(model);
            }

            var saved = await internalTransfers.ExecuteAsync(new InternalTransferRequest
            {
                UserId = userId, AccountId = model.AccountId,
                DestinationUniqueId = model.DestinationBankAccountUniqueId,
                Amount = model.Amount, Description = model.Description, Kind = "Transfer"
            });
            if (!saved)
            {
                this.ShowErrorMessage("Transfer rejected by account or fraud policy.");
                model.OwnAccounts = await this.GetAllAccountsAsync(userId);
                return this.View(model);
            }

            this.ShowSuccessMessage(NotificationMessages.SuccessfulMoneyTransfer);

            return this.RedirectToHome();
        }
    }
}