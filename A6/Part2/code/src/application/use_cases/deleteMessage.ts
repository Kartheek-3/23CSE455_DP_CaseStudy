import { IChatRepository } from '../../domain/repositories/IChatRepository'; 
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../constants/Tokens';
import { IDeleteMessageUseCase } from './Interfaces/IDeleteMessageUseCase';

@injectable()
export class DeleteMessageUseCase implements IDeleteMessageUseCase {
  constructor(
    @inject(TOKENS.CHAT_REPO) private _chatRepository: IChatRepository
  ) {}

  async execute(chatId: string, messageId: string): Promise<void> {
  
    await this._chatRepository.deleteMessage(
      chatId,
    messageId
    );
  }
}
