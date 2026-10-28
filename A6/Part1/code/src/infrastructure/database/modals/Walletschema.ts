// src/infrastructure/database/models/WalletSchema.ts

import mongoose, { Schema, Document } from 'mongoose';
import { Wallet, WalletTransaction } from '../../../domain/models/Wallet';
export interface WalletDocument extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  transactions: WalletTransaction[];
  createdAt: Date;
  updatedAt: Date;
}


const WalletTransactionSchema: Schema = new Schema<WalletTransaction>(
  {
    transactionId: { type: String },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  
  { _id: false } 
);

const WalletSchema: Schema = new Schema<WalletDocument>(
  {
    userId: { type:Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
    transactions: { type: [WalletTransactionSchema], default: [] },
  },
  { timestamps: true }
);

export const WalletModel = mongoose.model<WalletDocument>('Wallet', WalletSchema);
