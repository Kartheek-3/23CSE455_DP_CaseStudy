import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { Chat, Message, Participant } from '../../domain/models/Chat';
import ChatModel, { ChatDocument } from './modals/ChatSchema'; // MongoDB Schema
import { AuthError } from '../../domain/errors/Autherror';
import { ObjectId } from 'mongodb';
import { injectable } from 'tsyringe';
import { Types } from 'mongoose';
import { BaseRepository } from './BaseRepository';

@injectable()
export class MongoChatRepository extends BaseRepository<Chat, ChatDocument> implements IChatRepository {
  constructor() {
    super(ChatModel);
  }
  async findChatByBookingId(bookingId: string): Promise<Chat | null> {
    return super.findOne({ bookingId: new Types.ObjectId(bookingId) });
  }

  async createChat(chat: Chat): Promise<Chat> {
    return super.create(chat);
  }

  async addMessageToChat(
    bookingId: string,
    message: Message
  ): Promise<Message | null> {
     const result = await ChatModel.findOneAndUpdate(
    { bookingId: new Types.ObjectId(bookingId) },
    { $push: { messages: message } },
    { new: true, projection: { messages: { $slice: -1 } } }
  );

  if (!result || !result.messages || result.messages.length === 0) {
    return null;
  }

  return result.messages[result.messages.length - 1];
  }
  async findMessagesByBookingId(bookingId: string): Promise<Message[]> {
    const chat = await ChatModel.findOne({ bookingId: new Types.ObjectId(bookingId) })
      .select('messages')
      .lean();
  
    if (!chat) {
      return [];
    }
  
    return chat.messages;
  }
  async addParticipant(chatId: string, participant: Participant): Promise<void> {
   try{
    await ChatModel.updateOne(
      { _id: chatId },
      { $push: { participants: participant } }
    );
   }catch(error:any){ 
    
    console.error("Error adding participant:", error.message);
    throw new AuthError("Failed to add participant", 500);
   }  

  }
  async findById(chatId: string): Promise<Chat | null> {
    if (!Types.ObjectId.isValid(chatId)) {
      return null;
    }
    return super.findById(chatId);
  }

  
  async deleteMessage(chatId:string, messageId:string): Promise<void> {
    try {
      await ChatModel.updateOne(
      { bookingId: new Types.ObjectId(chatId) },
      {
        $pull: {
          messages: { _id: new Types.ObjectId(messageId)}
        }
      }
    );
    } catch (error:any) {
      console.error("Error deleting message:", error.message);
      throw new AuthError("Failed to delete message", 500);
      
    }
    
  }



}
