namespace BankSystem.Web.Pages.Account.Settings
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Threading.Tasks;
    using BankSystem.Models;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;

    [Authorize]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public class RecoveryCodesModel : BasePageModel
    {
        private readonly UserManager<BankUser> users;
        public RecoveryCodesModel(UserManager<BankUser> users) { this.users = users; }
        [BindProperty, Required, DataType(DataType.Password)]
        public string Password { get; set; }
        public IEnumerable<string> Codes { get; private set; }
        public void OnGet() { }
        public async Task<IActionResult> OnPostAsync()
        {
            var user = await users.GetUserAsync(User);
            if (user == null) return Forbid();
            if (!ModelState.IsValid) return Page();
            if (await users.IsLockedOutAsync(user)) return Forbid();
            if (!await users.CheckPasswordAsync(user, Password))
            {
                await users.AccessFailedAsync(user);
                ModelState.AddModelError(string.Empty, "Unable to generate recovery codes.");
                return Page();
            }
            if (!await users.GetTwoFactorEnabledAsync(user))
            {
                ModelState.AddModelError(string.Empty, "Enable authenticator two-factor authentication first.");
                return Page();
            }
            await users.ResetAccessFailedCountAsync(user);
            Codes = await users.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);
            ModelState.Clear();
            Password = null;
            return Page();
        }
    }
}
