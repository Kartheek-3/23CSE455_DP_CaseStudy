namespace BankSystem.Web.Controllers
{
    using System.ComponentModel.DataAnnotations;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using BankSystem.Services.MoneyTransfer;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Configuration;

    [Authorize]
    public sealed class BillPaymentsController : Controller
    {
        private readonly IInternalTransferService transfers;
        private readonly IConfiguration configuration;
        public BillPaymentsController(IInternalTransferService transfers, IConfiguration configuration)
        { this.transfers = transfers; this.configuration = configuration; }
        [HttpGet]
        public IActionResult Create() => View(new BillPaymentInput());
        [HttpPost, ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(BillPaymentInput input)
        {
            if (!ModelState.IsValid) return View(input);
            // Map an approved biller ID to an account; callers cannot choose arbitrary destinations.
            if (input.Biller != "electricity" && input.Biller != "water")
            { ModelState.AddModelError("Biller", "Unknown biller."); return View(input); }
            var destination = configuration["Billers:" + input.Biller];
            if (string.IsNullOrWhiteSpace(destination))
            { ModelState.AddModelError("Biller", "Biller is not configured."); return View(input); }
            var ok = await transfers.ExecuteAsync(new InternalTransferRequest
            {
                UserId = User.FindFirstValue(ClaimTypes.NameIdentifier), AccountId = input.AccountId,
                DestinationUniqueId = destination, Amount = input.Amount,
                Description = "Bill " + input.Invoice, Kind = "BillPayment"
            });
            if (!ok) { ModelState.AddModelError("", "Payment rejected."); return View(input); }
            return RedirectToAction("Index", "BankAccounts");
        }
        public sealed class BillPaymentInput
        {
            [Required] public string AccountId { get; set; }
            [Required] public string Biller { get; set; }
            [Required, StringLength(100)] public string Invoice { get; set; }
            [Range(typeof(decimal), "0.01", "1000000")] public decimal Amount { get; set; }
        }
    }
}
