namespace BankSystem.Web.Pages.Account
{
    using System.ComponentModel.DataAnnotations;
    using BankSystem.Web.Infrastructure.Authentication;
    using System.Threading.Tasks;
    using BankSystem.Models;
    using Common;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [AllowAnonymous]
    public class LoginWith2faModel : BasePageModel
    {
        private readonly ILogger<LoginWith2faModel> logger;
        private readonly SignInManager<BankUser> signInManager;

        public LoginWith2faModel(SignInManager<BankUser> signInManager, ILogger<LoginWith2faModel> logger)
        {
            this.signInManager = signInManager;
            this.logger = logger;
        }

        [BindProperty]
        public InputModel Input { get; set; }

        public bool RememberMe { get; set; }

        public string ReturnUrl { get; set; }

        public async Task<IActionResult> OnGetAsync(bool rememberMe, string returnUrl = null)
        {
            returnUrl = returnUrl ?? this.Url.Content("~/");

            var user = await this.signInManager.GetTwoFactorAuthenticationUserAsync();

            if (user == null)
            {
                return this.LocalRedirect(returnUrl);
            }

            this.ReturnUrl = returnUrl;
            this.RememberMe = rememberMe;

            return this.Page();
        }

        public async Task<IActionResult> OnPostAsync(bool rememberMe, string returnUrl = null)
        {
            if (!this.ModelState.IsValid)
            {
                return this.Page();
            }

            returnUrl = returnUrl ?? this.Url.Content("~/");

            var user = await this.signInManager.GetTwoFactorAuthenticationUserAsync();
            if (user == null)
            {
                return this.LocalRedirect(returnUrl);
            }

            ISecondFactorStrategy strategy = Input.UseRecoveryCode
                ? (ISecondFactorStrategy)new RecoverySecondFactor(signInManager)
                : new AuthenticatorSecondFactor(signInManager);
            var result = await new SecondFactorContext(strategy)
                .SignInAsync(Input.TwoFactorCode, rememberMe, Input.RememberMachine);

            if (!result.Succeeded)
            {
                if (result.IsLockedOut)
                {
                    await this.signInManager.SignOutAsync();

                    this.ShowErrorMessage(NotificationMessages.LoginLockedOut);
                    return this.RedirectToPage("./Login");
                }

                this.logger.LogWarning("Invalid authenticator code entered while logging in");

                this.ShowErrorMessage(NotificationMessages.TwoFactorAuthenticationCodeInvalid);
                return this.Page();
            }

            return this.LocalRedirect(returnUrl);
        }

        public class InputModel
        {
            [Required]
            [StringLength(64, MinimumLength = 6)]
            [DataType(DataType.Text)]
            [Display(Name = "Authenticator code")]
            public string TwoFactorCode { get; set; }

            [Display(Name = "Use a recovery code")]
            public bool UseRecoveryCode { get; set; }

            [Display(Name = "Remember this device")]
            public bool RememberMachine { get; set; }
        }
    }
}