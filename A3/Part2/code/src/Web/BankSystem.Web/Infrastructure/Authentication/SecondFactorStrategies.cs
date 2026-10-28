namespace BankSystem.Web.Infrastructure.Authentication
{
    using System;
    using System.Threading.Tasks;
    using BankSystem.Models;
    using Microsoft.AspNetCore.Identity;

    public interface ISecondFactorStrategy
    {
        Task<SignInResult> SignInAsync(string code, bool rememberMe, bool rememberMachine);
    }
    public sealed class AuthenticatorSecondFactor : ISecondFactorStrategy
    {
        private readonly SignInManager<BankUser> manager;
        public AuthenticatorSecondFactor(SignInManager<BankUser> manager) { this.manager = manager; }
        public Task<SignInResult> SignInAsync(string code, bool rememberMe, bool rememberMachine)
            => manager.TwoFactorAuthenticatorSignInAsync(code.Replace(" ", "").Replace("-", ""), rememberMe, rememberMachine);
    }
    public sealed class RecoverySecondFactor : ISecondFactorStrategy
    {
        private readonly SignInManager<BankUser> manager;
        public RecoverySecondFactor(SignInManager<BankUser> manager) { this.manager = manager; }
        public Task<SignInResult> SignInAsync(string code, bool rememberMe, bool rememberMachine)
            => manager.TwoFactorRecoveryCodeSignInAsync(code.Replace(" ", ""));
    }
    public sealed class SecondFactorContext
    {
        private readonly ISecondFactorStrategy strategy;
        public SecondFactorContext(ISecondFactorStrategy strategy) { this.strategy = strategy; }
        public Task<SignInResult> SignInAsync(string code, bool rememberMe, bool rememberMachine)
        {
            if (string.IsNullOrWhiteSpace(code)) return Task.FromResult(SignInResult.Failed);
            return strategy.SignInAsync(code, rememberMe, rememberMachine);
        }
    }
}
