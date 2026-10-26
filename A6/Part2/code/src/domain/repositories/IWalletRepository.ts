import { Wallet, WalletTransaction } from "../models/Wallet";

export interface IWalletRepository {
    createWallet(userId: string): Promise<Wallet>;
    getWalletByUserId(userId: string): Promise<Wallet | null>;
    walletBalance(userId: string): Promise<number>;
    creditAmount(userId: string, amount: number, description: string): Promise<Wallet>;
    debitAmount(userId: string, amount: number, description: string): Promise<Wallet>;
    getTransactions(userId: string,page:number,limit:number): Promise<{ transactions: WalletTransaction[], total: number }>;
  }
  