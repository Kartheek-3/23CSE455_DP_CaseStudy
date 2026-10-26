import { Message } from "../../../domain/models/Chat"; 

export interface GetMessagesInput {
  bookingId: string;
}

export interface IGetMessagesByBookingIdUseCase {
  execute(input: GetMessagesInput): Promise<Message[]>;
}
