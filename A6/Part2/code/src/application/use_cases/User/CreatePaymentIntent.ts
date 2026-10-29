import { inject, injectable } from 'tsyringe';
import { IStripeService } from '../../../domain/services/IStripeService'; 
import { IDriverRepository } from '../../../domain/repositories/IDriverepository';
import { AuthError } from '../../../domain/errors/Autherror';
import { HTTP_STATUS_CODES } from '../../../constants/HttpStatusCode';
import { TOKENS } from '../../../constants/Tokens';
import { CreatePaymentIntentRequestDto, CreatePaymentIntentResponseDto } from '../../dto/payment/PaymentDto';
import { ICreatePaymentIntent } from './interfaces/ICreatePaymentIntent';


@injectable()
export class CreatePaymentIntent implements ICreatePaymentIntent {
  constructor(
    @inject(TOKENS.PAYMENT_SERVICE)
    private _stripeService: IStripeService,

    @inject(TOKENS.IDRIVER_REPO) 
    private _driverRepository: IDriverRepository,
  ) {}

  async execute({
    amount,
    driverId,
  }: CreatePaymentIntentRequestDto): Promise<CreatePaymentIntentResponseDto>{
    const platformFee = Math.floor(amount * 0.1); // 10% platform fee
    const driver = await this._driverRepository.findDriverById(driverId);

    if(driver){
      if(!driver.stripeAccountId){
        throw new AuthError("Driver not found or not onboarded",  HTTP_STATUS_CODES.NOT_FOUND);
      }
    }

    return await this._stripeService.createPaymentIntent({
      amount,
      driverStripeAccountId: driver?.stripeAccountId || '',
      platformFee,
    });
  }
}
