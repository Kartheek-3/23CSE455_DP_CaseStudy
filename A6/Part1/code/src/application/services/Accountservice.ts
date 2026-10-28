import Stripe from 'stripe';

export interface IStripeAccountService {
  retrieveAccount(accountId: string): Promise<Stripe.Account>
  createExpressAccount(email: string, driverId: string): Promise<Stripe.Account>;
  createAccountLink(accountId: string): Promise<Stripe.AccountLink>;
}
