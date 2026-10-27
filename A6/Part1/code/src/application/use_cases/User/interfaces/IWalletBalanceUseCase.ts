export interface IWalletBalanceUseCase {
  execute(userId: string): Promise<number>;
}
