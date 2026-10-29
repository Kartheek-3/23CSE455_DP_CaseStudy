import { WalletTransactionHistoryResponseDto } from "../../../dto/wallet/WalletDto"; 

export interface IWalletTransaction {
  getTransactionHistory(
    userId: string,
    page: number,
    limit: number
  ): Promise<WalletTransactionHistoryResponseDto>;

  getWalletBalance(userId: string): Promise<number>;
}
