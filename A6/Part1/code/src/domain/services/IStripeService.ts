import Stripe from "stripe";

export interface CreatePaymentIntentParams {
    amount: number;
    driverStripeAccountId: string;
    platformFee: number;
  }
  
  export interface IStripeService {
    createPaymentIntent(params: CreatePaymentIntentParams): Promise<{
      clientSecret: string;
      paymentIntentId: string
    }>
  
  retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
  transferToDriverFromWallet(
  rideId: string,
  amount: number,
  driverStripeAccountId: string
): Promise<Stripe.Transfer>;

  }
  
  