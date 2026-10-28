# Assigned-module inspection

All paths are relative to `data/code/src/`.

| Module | Baseline evidence | Finding / evolution |
|---|---|---|
| Account management | `Services/BankSystem/BankSystem.Services/BankAccount/BankAccountService.cs`; `Web/BankSystem.Web/Controllers/BankAccountsController.cs` | Service validates and creates accounts through EF; repository interface is not separately declared. |
| Authentication | `Web/BankSystem.Web/Pages/Account/Login.cshtml.cs`, `LoginWith2fa.cshtml.cs`; `Startup.cs` | ASP.NET Identity password + authenticator already exist. CH01 adds recovery-code alternative rather than claiming that 2FA itself is new. |
| Transactions | `Services/BankSystem/BankSystem.Services/MoneyTransfer/MoneyTransferService.cs`; `Data/BankSystem/BankSystem.Models/MoneyTransfer.cs` | Signed postings persist account balance and transfer history. CH02 introduces a persisted BillPayment type. |
| Fund transfer | `Web/BankSystem.Web/Areas/MoneyTransfers/Controllers/InternalController.cs` and `GlobalController.cs` | Baseline internal controller performs two separate service postings. CH02 replaces this flow with one atomic internal-payment service. |
| Payment | `Web/BankSystem.Web/Controllers/PaymentsController.cs`; `Api/CardPaymentsController.cs`; `Infrastructure/Helpers/DirectPaymentsHelper.cs` | Existing direct/card flows interact with CentralApi; CH02 introduces configured local billers. External flows are not claimed tested. |
| Fraud detection | `InternalController.cs`, `Startup.cs`, `Infrastructure/Filters/DecryptAndVerifyRequest.cs` | Ownership, balance, Identity lockout and message-signature checks exist. No standalone configurable risk-handler chain was identified in the selected baseline. CH03 adds a high-value rule. |
| Notification | `Common/BankSystem.Common/EmailSender/Implementation/EmailSender.cs`; `MoneyTransferService.cs` | SendGrid adapter maps application inputs to vendor calls. Notification is directly invoked, not Observer. |

The inspected scope does not enumerate internal patterns inside EF Core, Identity, AutoMapper or SendGrid. DemoShop and CentralApi's internal classes are not counted. A framework dependency is not relabelled as student-written code.
