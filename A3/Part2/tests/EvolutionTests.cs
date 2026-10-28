using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Security.Claims;
using BankSystem.Data;
using BankSystem.Models;
using BankSystem.Common.EmailSender.Interface;
using BankSystem.Services.MoneyTransfer;
using BankSystem.Services.Fraud;
using BankSystem.Web.Infrastructure.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;
using Microsoft.Extensions.DependencyInjection;

public class EvolutionTests
{
    private sealed class Fixture : IDisposable
    {
        private readonly SqliteConnection connection = new SqliteConnection("Data Source=:memory:");
        public BankSystemDbContext Db { get; }
        public Mock<IEmailSender> Emails { get; } = new Mock<IEmailSender>();
        public InternalTransferService Service { get; }
        public Fixture()
        {
            connection.Open();
            Db = new BankSystemDbContext(new DbContextOptionsBuilder<BankSystemDbContext>().UseSqlite(connection).Options);
            Db.Database.EnsureCreated();
            var alice = new BankUser { Id="U1", UserName="alice", Email="alice@example.invalid", FullName="Alice Example" };
            var biller = new BankUser { Id="U2", UserName="biller", Email="biller@example.invalid", FullName="Demo Utility" };
            Db.Users.AddRange(alice,biller);
            Db.Accounts.AddRange(new BankAccount {Id="A1", UniqueId="ABCD12345678", Name="Source", User=alice, Balance=20000m},
                new BankAccount {Id="A2",UniqueId="ABCD87654321",Name="Biller",User=biller,Balance=100m});
            Db.SaveChanges();
            Service = new InternalTransferService(Db, Emails.Object,
                new PositiveAmountRule(new SufficientFundsRule(new HighValueRule(10000m))));
        }
        public InternalTransferRequest Request(decimal amount=25m) => new InternalTransferRequest {
            UserId="U1", AccountId="A1", DestinationUniqueId="ABCD87654321",Amount=amount,Kind="BillPayment",Description="Invoice 1"};
        public void Dispose() { Db.Dispose(); connection.Dispose(); }
    }
    [Theory]
    [InlineData("Transfer")]
    [InlineData("BillPayment")]
    public async Task PostsBalancedEntriesAndPreservesTotal(string kind)
    {
        using var f = new Fixture(); var request=f.Request(); request.Kind=kind;
        Assert.True(await f.Service.ExecuteAsync(request));
        var rows=await f.Db.Transfers.ToListAsync();
        Assert.Equal(2,rows.Count);Assert.Equal(0m,rows.Sum(x=>x.Amount));
        Assert.Single(rows.Select(x=>x.ReferenceNumber).Distinct());
        Assert.All(rows,r=>Assert.Equal(kind,r.TransactionType));
        Assert.Equal(19975m,(await f.Db.Accounts.FindAsync("A1")).Balance);
        Assert.Equal(125m,(await f.Db.Accounts.FindAsync("A2")).Balance);
        f.Emails.Verify(e=>e.SendEmailAsync(It.IsAny<string>(),It.IsAny<string>(),It.IsAny<string>()),Times.Exactly(2));
    }
    [Theory]
    [InlineData(0)] [InlineData(-1)] [InlineData(10000.01)] [InlineData(20001)] [InlineData(1.001)]
    public async Task InvalidAmountDoesNotMutate(decimal amount)
    {
        using var f=new Fixture(); Assert.False(await f.Service.ExecuteAsync(f.Request(amount)));
        Assert.Empty(f.Db.Transfers);Assert.Equal(20000m,(await f.Db.Accounts.FindAsync("A1")).Balance);
        f.Emails.Verify(e=>e.SendEmailAsync(It.IsAny<string>(),It.IsAny<string>(),It.IsAny<string>()),Times.Never());
    }
    [Fact] public async Task InclusiveHighValueBoundaryPasses()
    {using var f=new Fixture();Assert.True(await f.Service.ExecuteAsync(f.Request(10000m)));}
    [Fact] public async Task OwnershipCannotBeForged()
    {using var f=new Fixture();var r=f.Request();r.UserId="U2";Assert.False(await f.Service.ExecuteAsync(r));Assert.Empty(f.Db.Transfers);}
    [Fact] public async Task MissingDestinationRejected()
    {using var f=new Fixture();var r=f.Request();r.DestinationUniqueId="missing";Assert.False(await f.Service.ExecuteAsync(r));Assert.Empty(f.Db.Transfers);}
    [Fact] public async Task SelfTransferRejected()
    {using var f=new Fixture();var r=f.Request();r.DestinationUniqueId="ABCD12345678";Assert.False(await f.Service.ExecuteAsync(r));}
    [Fact] public async Task UnknownTypeRejected()
    {using var f=new Fixture();var r=f.Request();r.Kind="Untrusted";Assert.False(await f.Service.ExecuteAsync(r));}
    [Fact] public async Task MissingSourceRejected()
    {using var f=new Fixture();var r=f.Request();r.AccountId="missing";Assert.False(await f.Service.ExecuteAsync(r));}
    [Fact] public async Task NullRequestRejected()
    {using var f=new Fixture();Assert.False(await f.Service.ExecuteAsync(null));}
    [Fact] public async Task NotificationFailureDoesNotRollbackCommittedTransfer()
    {using var f=new Fixture();f.Emails.Setup(e=>e.SendEmailAsync(It.IsAny<string>(),It.IsAny<string>(),It.IsAny<string>())).ThrowsAsync(new Exception("simulated"));Assert.True(await f.Service.ExecuteAsync(f.Request()));Assert.Equal(2,await f.Db.Transfers.CountAsync());}
    [Fact] public async Task SqlFailureRollsBackBothBalances()
    {
        using var f=new Fixture();
        await f.Db.Database.ExecuteSqlRawAsync("CREATE TRIGGER reject_entry BEFORE INSERT ON Transfers BEGIN SELECT RAISE(ABORT, 'simulated failure'); END;");
        await Assert.ThrowsAsync<DbUpdateException>(()=>f.Service.ExecuteAsync(f.Request()));
        foreach(var e in f.Db.ChangeTracker.Entries().ToList())e.State=EntityState.Detached;
        Assert.Equal(20000m,(await f.Db.Accounts.FindAsync("A1")).Balance);
        Assert.Equal(100m,(await f.Db.Accounts.FindAsync("A2")).Balance);
        Assert.Empty(f.Db.Transfers);
    }
    [Theory] [InlineData(0)] [InlineData(-1)]
    public void InvalidPolicyConfigurationRejected(decimal limit)
    {Assert.Throws<ArgumentOutOfRangeException>(()=>new HighValueRule(limit));}
    [Fact] public void RuleChainStopsBeforeSuccessor()
    {var tail=new Mock<ITransferRule>();Assert.False(new PositiveAmountRule(tail.Object).Allows(0,10));tail.Verify(x=>x.Allows(It.IsAny<decimal>(),It.IsAny<decimal>()),Times.Never());}
    [Fact] public void InsufficientFundsRuleRejectsWithoutHighValueViolation()
    {Assert.False(new PositiveAmountRule(new SufficientFundsRule(new HighValueRule(10000))).Allows(100,99));}

    [Fact] public async Task TooLongDescriptionRejected()
    {using var f=new Fixture();var r=f.Request();r.Description=new string('x',151);Assert.False(await f.Service.ExecuteAsync(r));Assert.Empty(f.Db.Transfers);}
    [Fact] public async Task IdentityRecoveryCodesAreOneTimeAndOldSetsAreInvalidated()
    {
        using var f=new Fixture();
        var services=new ServiceCollection();services.AddLogging();services.AddSingleton(f.Db);
        services.AddIdentityCore<BankUser>().AddEntityFrameworkStores<BankSystemDbContext>();
        using var provider=services.BuildServiceProvider();
        var users=provider.GetRequiredService<UserManager<BankUser>>();
        var user=await users.FindByIdAsync("U1");
        var codes=(await users.GenerateNewTwoFactorRecoveryCodesAsync(user,3)).ToArray();
        Assert.Equal(3,await users.CountRecoveryCodesAsync(user));
        Assert.True((await users.RedeemTwoFactorRecoveryCodeAsync(user,codes[0])).Succeeded);
        Assert.False((await users.RedeemTwoFactorRecoveryCodeAsync(user,codes[0])).Succeeded);
        await users.GenerateNewTwoFactorRecoveryCodesAsync(user,3);
        Assert.False((await users.RedeemTwoFactorRecoveryCodeAsync(user,codes[1])).Succeeded);
    }

    private static Mock<SignInManager<BankUser>> SignInMock()
    {
        var users=new UserManager<BankUser>(Mock.Of<IUserStore<BankUser>>(),Options.Create(new IdentityOptions()),
            new PasswordHasher<BankUser>(),new IUserValidator<BankUser>[0],new IPasswordValidator<BankUser>[0],
            new UpperInvariantLookupNormalizer(),new IdentityErrorDescriber(),null,Mock.Of<ILogger<UserManager<BankUser>>>());
        return new Mock<SignInManager<BankUser>>(users,Mock.Of<IHttpContextAccessor>(),Mock.Of<IUserClaimsPrincipalFactory<BankUser>>(),
            Options.Create(new IdentityOptions()),Mock.Of<ILogger<SignInManager<BankUser>>>(),
            Mock.Of<Microsoft.AspNetCore.Authentication.IAuthenticationSchemeProvider>(),Mock.Of<IUserConfirmation<BankUser>>());
    }
    [Fact] public async Task AuthenticatorStrategyPreservesNormalization()
    {var m=SignInMock();m.Setup(x=>x.TwoFactorAuthenticatorSignInAsync("123456",false,false)).ReturnsAsync(SignInResult.Success);
     Assert.True((await new SecondFactorContext(new AuthenticatorSecondFactor(m.Object)).SignInAsync("123-456",false,false)).Succeeded);}
    [Fact] public async Task RecoveryStrategyDelegatesToIdentity()
    {var m=SignInMock();m.Setup(x=>x.TwoFactorRecoveryCodeSignInAsync("abc-def")).ReturnsAsync(SignInResult.Success);
     Assert.True((await new SecondFactorContext(new RecoverySecondFactor(m.Object)).SignInAsync(" abc-def ",true,true)).Succeeded);
     m.Verify(x=>x.TwoFactorRecoveryCodeSignInAsync("abc-def"),Times.Once());}
    [Fact] public async Task EmptyCodeDoesNotCallProvider()
    {var s=new Mock<ISecondFactorStrategy>();Assert.False((await new SecondFactorContext(s.Object).SignInAsync(" ",false,false)).Succeeded);s.Verify(x=>x.SignInAsync(It.IsAny<string>(),It.IsAny<bool>(),It.IsAny<bool>()),Times.Never());}
    [Fact] public async Task FailedSecondFactorIsNotConvertedToSuccess()
    {var s=new Mock<ISecondFactorStrategy>();s.Setup(x=>x.SignInAsync("bad",false,false)).ReturnsAsync(SignInResult.Failed);Assert.False((await new SecondFactorContext(s.Object).SignInAsync("bad",false,false)).Succeeded);}
}
