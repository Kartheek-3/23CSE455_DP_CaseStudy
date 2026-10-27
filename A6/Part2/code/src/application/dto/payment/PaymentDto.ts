/**
 * Payment DTOs
 */

export interface CreatePaymentIntentRequestDto {
  amount: number;
  driverId: string;
}

export interface CreatePaymentIntentResponseDto {
  clientSecret: string;
  paymentIntentId: string;
}
