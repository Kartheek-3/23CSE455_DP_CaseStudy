import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { Types } from 'mongoose';
import { Role } from '../../domain/models/Chat'; // Import Role type
import { inject, injectable } from 'tsyringe';
import { ChatService } from '../services/chatService';
import { TOKENS } from '../../constants/Tokens';

interface SaveMessageDTO {
  bookingId: string;
  senderId: string;
  senderRole: Role;
  type: 'text' | 'image' | 'pdf';
  text?: string;           
  fileUrl?: string; 
}
@injectable()
export class SaveMessageUseCase {
  constructor(
    @inject(TOKENS.CHAT_REPO) private _chatRepository: IChatRepository,
    private _chatService: ChatService
  ) {}

  async execute({
    bookingId,
    senderId,
    senderRole,
    type,
    text,
    fileUrl,
  }: SaveMessageDTO) {
    const bookingObjectId = new Types.ObjectId(bookingId);
    const senderObjectId = new Types.ObjectId(senderId);

    // ✅ Validation based on message type
    if (type === 'text' && !text) {
      throw new Error('Text message must include text content.');
    }

    if ((type === 'image' || type === 'pdf') && !fileUrl) {
      throw new Error(`${type.toUpperCase()} message must include a fileUrl.`);
    }

    let chat = await this._chatRepository.findChatByBookingId(bookingId);

    const newMessage = {
      senderId: senderObjectId,
      senderRole,
      type,
      ...(text && { text }),
      ...(fileUrl && { fileUrl }),
      createdAt: new Date(),
    };

    if (!chat) {
      chat = await this._chatRepository.createChat({
        bookingId: bookingObjectId,
        participants: [
          { participantId: senderObjectId, role: senderRole },
        ],
        messages: [newMessage],
      });

      return newMessage;
    }

    await this._chatService.addParticipantIfNeeded(chat._id!.toString(), senderObjectId, senderRole);
    
    return await this._chatRepository.addMessageToChat(bookingId, newMessage);

   
  }
}
