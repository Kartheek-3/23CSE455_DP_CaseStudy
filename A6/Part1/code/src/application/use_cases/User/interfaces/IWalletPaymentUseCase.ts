export interface IWalletPaymentUseCase {
  WalletRidePayment(rideId: string, userId: string, amount: number): Promise<void>;
}
