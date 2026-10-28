import { Chat, Message, Participant } from '../models/Chat';

export interface IChatRepository {
  findChatByBookingId(bookingId: string): Promise<Chat | null>;
  findMessagesByBookingId(bookingId: string): Promise<Message[]>;

  createChat(chat: Chat): Promise<Chat>;
  addMessageToChat(
    bookingId: string,
    message: Message
  ): Promise<Message | null>;
  findById(chatId: string): Promise<Chat | null>;
  addParticipant(chatId: string, participant: Participant): Promise<void>;
  deleteMessage(chatId: string, messageId:string): Promise<void>;

}

