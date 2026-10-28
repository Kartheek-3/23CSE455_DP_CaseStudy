
export interface IVerifyDriverPaymentAccount {
  execute(driverId: string): Promise<void>;
}
