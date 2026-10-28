
export type Role = 'User' | 'Driver' | 'Admin';
export type MessageType = 'text' | 'image' | 'pdf'|'doc';
import { Types } from 'mongoose';
export interface Message { 
  _id?: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: Role

  type: MessageType;         // 'text' | 'image' | 'pdf'
  text?: string;             // Required only if type is 'text'
  fileUrl?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Participant {
  participantId: Types.ObjectId;
  role: Role
}

export interface Chat {
  _id?: Types.ObjectId;
  bookingId: Types.ObjectId;
  participants: Participant[];
  messages: Message[];
  createdAt?: Date;
  updatedAt?: Date;
}