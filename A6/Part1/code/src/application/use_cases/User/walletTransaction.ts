import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { AuthError } from "../../../domain/errors/Autherror";
import { inject, injectable } from "tsyringe";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IWalletTransaction } from "./interfaces/IWalletTransaction";
import { TOKENS } from "../../../constants/Tokens";
import { WalletTransactionHistoryResponseDto, toWalletTransactionHistoryResponse } from "../../dto/wallet/WalletDto";

@injectable()
export class WalletTransactionUseCase implements IWalletTransaction {
  constructor(
    @inject(TOKENS.WALLET_REPO) private _walletRepository: IWalletRepository
  ) {}

  async getTransactionHistory(
    userId: string,
    page: number,
    limit: number
  ): Promise<WalletTransactionHistoryResponseDto> {
    const wallet = await this._walletRepository.getWalletByUserId(userId);
    if (!wallet) {
      throw new AuthError("Wallet not found.", HTTP_STATUS_CODES.NOT_FOUND);
    }
    const { transactions, total } = await this._walletRepository.getTransactions(userId, page, limit);
    return toWalletTransactionHistoryResponse(transactions, total, page, limit);
  }

  async getWalletBalance(userId: string): Promise<number> {
    const wallet = await this._walletRepository.getWalletByUserId(userId);
    if (!wallet) {
      throw new AuthError("Wallet not found.", HTTP_STATUS_CODES.NOT_FOUND);
    }
    return wallet.balance;
  }
}
