// src/application/use_cases/VerifyDriverPaymentAccount.ts
import { inject, injectable } from 'tsyringe';
import { IStripeAccountService } from '../../services/Accountservice'; 
import { IDriverRepository } from '../../../domain/repositories/IDriverepository'; 
import { AuthError } from '../../../domain/errors/Autherror'; 
import { TOKENS } from '../../../constants/Tokens';
import { HTTP_STATUS_CODES } from '../../../constants/HttpStatusCode';
import { IVerifyDriverPaymentAccount } from './interfaces/IVerifyDriverPaymentAccount';

@injectable()
export class VerifyDriverPaymentAccount  implements IVerifyDriverPaymentAccount {
  constructor(
    @inject(TOKENS.STRIPE_SERVICE) private _stripeService: IStripeAccountService,
    @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository
  ) {}

  async execute(driverId: string): Promise<void> {
    const driver=await this._driverRepository.findDriverById(driverId);
    if(!driver||!driver.stripeAccountId){
      throw new AuthError('Driver not found or Stripe account ID missing', HTTP_STATUS_CODES.NOT_FOUND); 
      
    }
    const account = await this._stripeService.retrieveAccount(driver.stripeAccountId);
// console.log('Account:', account);
console.log(account.charges_enabled, account.payouts_enabled);
    if (account.charges_enabled&&account.payouts_enabled) {
     
      await this._driverRepository.update(driverId,{activePayment:true});
    } else {
        await this._driverRepository.update(driverId,{stripeAccountId:''});
      throw new AuthError('Stripe account not yet fully activated',HTTP_STATUS_CODES.BAD_REQUEST);
    }

  }

}
