import { CreatePaymentIntentRequestDto, CreatePaymentIntentResponseDto } from "../../../dto/payment/PaymentDto"; 

export interface ICreatePaymentIntent {
  execute(request: CreatePaymentIntentRequestDto): Promise<CreatePaymentIntentResponseDto>;
}
