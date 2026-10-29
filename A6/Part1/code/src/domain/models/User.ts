import { ObjectId } from "mongoose";

export interface User {
  _id?: ObjectId; 
  name: string;
  email: string;
  mobile: string;
  profile:string;
  location?: {
    latitude: number;
    longitude: number;
  };
  place?:string;
  password: string;
  googleId?: string;
  referralCode?: string;
  onlineStatus: 'online' | 'offline';
  lastSeen: Date;
  role: "user" | "admin"; 
  referalPay?:boolean
  activePayment?: boolean;
  stripeAccountId?: string;
  referredBy?: string;
  isBlock:boolean;
  createdAt?: Date;
}
