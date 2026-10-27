import { IWalletRepository } from "../../domain/repositories/IWalletRepository"; 
import { AuthError } from "../../domain/errors/Autherror"; 
import { Wallet } from "../../domain/models/Wallet"; 
import { inject, injectable } from "tsyringe";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { TOKENS } from "../../constants/Tokens";


@injectable()
export class WalletService {
  constructor( @inject(TOKENS.WALLET_REPO) private _walletRepository: IWalletRepository) {}

  async createWallet(userId: string): Promise<Wallet> {
    try {
      const existingWallet = await this._walletRepository.getWalletByUserId(userId);
      if (existingWallet) {
        throw new AuthError("Wallet already exists for this user.",HTTP_STATUS_CODES.CONFLICT);
      }
      return await this._walletRepository.createWallet(userId);
    } catch (error: any) {
      throw new AuthError("Failed to create wallet: " + error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async creditAmount(userId: string, amount: number, description: string): Promise<Wallet> {
    try {
      const wallet = await this._walletRepository.getWalletByUserId(userId);
      if (!wallet) {
        throw new AuthError("Wallet not found.",HTTP_STATUS_CODES.NOT_FOUND);
      }

      const updatedWallet = await this._walletRepository.creditAmount(
        userId,
        amount,
        description
      );

      return updatedWallet;
    } catch (error: any) {
      throw new AuthError("Failed to credit wallet: " + error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async debitAmount(userId: string, amount: number, description: string): Promise<Wallet> {
    try {
      const wallet = await this._walletRepository.getWalletByUserId(userId);
      if (!wallet) {
        throw new AuthError("Wallet not found.", HTTP_STATUS_CODES.NOT_FOUND);
      }

      if (wallet.balance < amount) {
        throw new AuthError("Insufficient wallet balance.", HTTP_STATUS_CODES.BAD_REQUEST);
      }

      const updatedWallet = await this._walletRepository.debitAmount(
        userId,
        amount,
        description
      );

      return updatedWallet;
    } catch (error: any) {
      throw new AuthError("Failed to debit wallet: " + error.message,HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async getWalletByUserId(userId: string): Promise<Wallet | null> {
    try {
      const wallet = await this._walletRepository.getWalletByUserId(userId);
      if (!wallet) {
        throw new AuthError("Wallet not found.", HTTP_STATUS_CODES.NOT_FOUND);
      }
      return wallet;
    } catch (error: any) {
      throw new AuthError("Failed to fetch wallet: " + error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}
