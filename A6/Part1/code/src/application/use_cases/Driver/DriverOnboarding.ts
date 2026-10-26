import { inject, injectable } from 'tsyringe';
import { IStripeAccountService } from '../../services/Accountservice';
import { IDriverRepository } from '../../../domain/repositories/IDriverepository';
import { TOKENS } from '../../../constants/Tokens';
import { IOnboardDriverUseCase } from './interfaces/IOnboardDriverUseCase';

@injectable()
export class OnboardDriverUseCase implements IOnboardDriverUseCase {
  constructor(
    @inject(TOKENS.STRIPE_SERVICE) private _stripeService: IStripeAccountService,
     @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository
  ) {}

  async execute(email: string, driverId: string):Promise<string> {
    const account = await this._stripeService.createExpressAccount(email, driverId);
    
    await this._driverRepository.updateStripeAccount(driverId, account.id);
    const accountLink = await this._stripeService.createAccountLink(account.id);
    return accountLink.url;
  }
}
