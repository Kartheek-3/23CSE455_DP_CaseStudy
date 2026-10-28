import { Types } from "mongoose";

export interface Driver {
    _id?: Types.ObjectId | string;
    name: string;
    email: string;
    mobile: string;
    password: string;
    profileImage: string;
    location:
    | {
        
        latitude: number;
        longitude: number;
      }
    | {
        type: "Point";
        coordinates: [number, number];
      };
    place:string;
    aadhaarNumber: string;
    licenseNumber: string;
    aadhaarImage: string;
    licenseImage: string;
    status: "pending" | "approved" | "rejected";
    isBlock: boolean; 
    role:"driver";
    onlineStatus: 'online' | 'offline';
    lastSeen: Date;
    activePayment?: boolean;
    stripeAccountId?: string;
    reason?: string; 
     averageRating: number;
     totalRatings: number;
    totalRatingPoints: number;
    createdAt?: Date;
  }
  
  