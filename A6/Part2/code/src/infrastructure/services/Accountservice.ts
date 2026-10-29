import { injectable } from 'tsyringe';
import Stripe from 'stripe';
import { IStripeAccountService } from '../../application/services/Accountservice';
import { AuthError } from '../../domain/errors/Autherror';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-03-31.basil'
    
});

@injectable()
export class StripeService implements IStripeAccountService {
  async createExpressAccount(email: string, driverId: string): Promise<Stripe.Account> {
    try {
    return await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        driver_id: driverId,
      },
    });
} catch (error: any) {
    console.error('Stripe account creation failed:', error);
    throw new AuthError(`${error.message}`, 500);
  }
  }

  async createAccountLink(accountId: string): Promise<Stripe.AccountLink> {
    try{
     
    return await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/driver/onboard-failure`,
      return_url: `${process.env.FRONTEND_URL}/driver/onboard-success`,
      type: 'account_onboarding'
    });
  }
  catch(error:any){
    console.log(error)
    throw new AuthError(`${error.message}`, 500);
}
}
async retrieveAccount(accountId: string): Promise<Stripe.Account> {
  try {
    return await stripe.accounts.retrieve(accountId);
  } catch (err: any) {
    console.error('Stripe retrieve failed:', err);
    throw new AuthError(err.message, 500);
  }
}



}
