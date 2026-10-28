// src/infrastructure/database/schemas/ChatSchema.ts
import { Schema, model, Document, Types } from 'mongoose';
import { Chat, Message, Participant } from '../../../domain/models/Chat';


export interface ChatDocument extends Omit<Chat, '_id'>, Document {}

const messageSchema = new Schema<Message>(
  {
    senderId: { type: Schema.Types.ObjectId, required: true, refPath: 'messages.senderRole' },
    senderRole: {
      type: String,
      required: true,
      enum: ['User', 'Driver', 'Admin'], // Ensure it's synced with Role type
    },
   
     type: {
      type: String,
      required: true,
      enum: ['text', 'image', 'pdf','doc'], 
    },
    text: {
      type: String,
      required: function () {
        return this.type === 'text';
      },
    },
    fileUrl: {
      type: String,
      required: function () {
        return this.type === 'image' || this.type === 'pdf'||this.type=='doc';
      },
    },
  },
  { timestamps: true }
);

const participantSchema = new Schema<Participant>(
  {
    participantId: { type: Schema.Types.ObjectId, required: true },
    role: {
      type: String,
      required: true,
      enum: ['User', 'Driver', 'Admin'],
    },
  },
  { _id: false }
);

const chatSchema = new Schema<ChatDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, required: true, ref: 'Booking' },
    participants: { type: [participantSchema], required: true },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
  
);

export default model<ChatDocument>('Chat', chatSchema);

