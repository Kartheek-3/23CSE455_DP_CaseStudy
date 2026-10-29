import { inject, injectable } from 'tsyringe';
import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { Message } from '../../domain/models/Chat';
import { TOKENS } from '../../constants/Tokens';
import { IGetMessagesByBookingIdUseCase } from './Interfaces/IGetMessage';

interface GetMessagesInput {
  bookingId: string;
}
@injectable()
export class GetMessagesByBookingId implements IGetMessagesByBookingIdUseCase {
  constructor(
    @inject(TOKENS.CHAT_REPO)
    private _chatRepository: IChatRepository
  ) {}

  async execute(input: GetMessagesInput): Promise<Message[]> {
    const { bookingId } = input;
    const messages = await this._chatRepository.findMessagesByBookingId(bookingId);
    return messages;
  }
}