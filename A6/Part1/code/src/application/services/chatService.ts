import { inject, injectable } from 'tsyringe';
import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { Types } from 'mongoose';
import { Role } from '../../domain/models/Chat';
import { TOKENS } from '../../constants/Tokens';

@injectable()
export class ChatService {
  constructor(
    @inject(TOKENS.CHAT_REPO) private _chatRepository: IChatRepository
  ) {}

  async addParticipantIfNeeded(chatId: string, senderId: Types.ObjectId, senderRole: Role): Promise<void> {
    const chat = await this._chatRepository.findById(chatId);
    if (!chat) throw new Error('Chat not found');

    const isAlreadyParticipant = chat.participants.some(
      (p) => p.participantId.equals(senderId)
    );

    if (!isAlreadyParticipant) {
      await this._chatRepository.addParticipant(chatId, {
        participantId: senderId,
        role: senderRole,
      });
    }
  }
}
