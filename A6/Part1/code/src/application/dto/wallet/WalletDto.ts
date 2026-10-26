import { WalletTransaction } from "../../../domain/models/Wallet";
/**
 * Wallet DTOs
 */

export interface WalletTransactionDto {
  transactionId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: Date;
}

export interface WalletTransactionHistoryResponseDto {
  transactions: WalletTransactionDto[];
  total: number;
  page: number;
  totalPages: number;
}

export const toWalletTransactionResponse = (transaction: WalletTransaction): WalletTransactionDto => {
  return {
    transactionId: transaction.transactionId || "",
    amount: transaction.amount,
    type: transaction.type,
    description: transaction.description,
    createdAt: transaction.createdAt || new Date(),
  };
};

export const toWalletTransactionHistoryResponse = (
  transactions: WalletTransaction[],
  total: number,
  page: number,
  limit: number
): WalletTransactionHistoryResponseDto => {
  return {
    transactions: transactions.map(toWalletTransactionResponse),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
