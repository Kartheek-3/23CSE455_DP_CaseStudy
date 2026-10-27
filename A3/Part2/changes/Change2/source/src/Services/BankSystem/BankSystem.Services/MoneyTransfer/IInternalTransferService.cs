namespace BankSystem.Services.MoneyTransfer
{
    using System.Threading.Tasks;
    public interface IInternalTransferService
    {
        Task<bool> ExecuteAsync(InternalTransferRequest request);
    }
}
