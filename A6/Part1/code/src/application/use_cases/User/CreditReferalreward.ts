// src/application/use_cases/rewards/CreditReferralReward.ts
import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";

import { AuthError } from "../../../domain/errors/Autherror";
import { WalletService } from "../../services/WalletService";
import { TOKENS } from "../../../constants/Tokens";

import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";

@injectable()
export class CreditReferralReward {
  constructor(
    @inject(TOKENS.IUSER_REPO) private _userRepo: IUserRepository,
   
        @inject(TOKENS.WALLET_SERVICE) private _walletService:WalletService ,
  ) {}

  async execute(userId: string, amount: number): Promise<void> {
    const user = await this._userRepo.getUserById(userId);
   let referedUserName:string|undefined
    if (!user) {
      throw new AuthError("User not found", HTTP_STATUS_CODES.NOT_FOUND);
    }

    const referredBy = user.referredBy;
   
    if (!referredBy) {
      throw new AuthError("No referral found for this user", HTTP_STATUS_CODES.BAD_REQUEST);
    }
    if(user.referredBy){
    const referedUser=await this._userRepo.getUserById(user?.referredBy?.toString())
    referedUserName=referedUser?.name
    }
    // 1. Credit to referred user's wallet
    await this._walletService.creditAmount(userId,amount,`Referral bonus for by register through${referedUserName} ` )
      
    await this._walletService.creditAmount(referredBy,amount, `Referral bonus for inviting ${user.name}` )

    await this._userRepo.updateUser(userId, {referalPay:false});
  }
}
