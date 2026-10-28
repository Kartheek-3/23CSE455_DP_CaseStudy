import { injectable } from "tsyringe";
import { IUserRepository, UserWithVehicleCount } from "../../domain/repositories/IUserepository"; 
import { User } from "../../domain/models/User";
import UserModel, { UserDocument } from "./modals/userschema";  // MongoDB Schema
import { isValidObjectId, Types } from "mongoose";
import { AuthError } from "../../domain/errors/Autherror";
import { ConflictError } from "../../domain/errors/ConflictError";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class MongoUserRepository extends BaseRepository<User, UserDocument> implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  async create(user: User): Promise<User> {
    return super.create(user);
  }
  async updateUser(userId: string, data: Partial<User>): Promise<User | null> {
    try {
      if (!isValidObjectId(userId)) throw new Error("Invalid user ID");
       
      const user = await UserModel.findById(userId);
      if (!user) return null;
    
      Object.assign(user, data);
    
      await user.save();
    
      return user.toObject() as User;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError("User with this email or mobile already exists");
      }
      throw error;
    }
  }
    

  async findByEmail(email: string): Promise<User | null> {
    return super.findOne({ email });
  }

  async findByReferralCode(referralCode: string): Promise<User | null> {
    if (!referralCode) return null; 
    return super.findOne({ referralCode });
  }

  async getUserById(userId: string): Promise<User | null> {
    if (!isValidObjectId(userId)) return null; 
    return super.findById(userId); // BaseRepository findById already uses lean()
  }
  
  
  async getUsers():Promise<UserWithVehicleCount[]|null>{
    try {
      const usersWithVehicleCount = await UserModel.aggregate([
        {
          $lookup: {
            from: "vehicles",
            localField: "_id",
            foreignField: "userId",
            as: "vehicles",
          },
        },
        {
          $addFields: {
            vehicleCount: { $size: "$vehicles" },
          },
        },
        {
          $project: {
            password: 0, // Hide sensitive fields
            vehicles: 0, // Remove vehicles array if not needed
          },
        },
      ]);

      return usersWithVehicleCount;
    } catch (error) {
      console.log(error);
      
      throw new Error(`Failed to get users: ${(error as Error).message}`);
    }
  }
  
async blockOrUnblockUser(userId: string,isBlock: boolean): Promise<UserWithVehicleCount | null> {
  try {
    if (!isValidObjectId(userId.trim())) {
      throw new Error("Invalid userId format");
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId.trim(),
      { isBlock },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return null; // User not found
    }

    // Fetch vehicle count
    const vehicleCountResult = await UserModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(userId.trim()) },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "userId",
          as: "vehicles",
        },
      },
      {
        $addFields: {
          vehicleCount: { $size: "$vehicles" },
        },
      },
      {
        $project: {
          vehicles: 0, // Remove vehicles array
        },
      },
    ]);

    if (vehicleCountResult.length === 0) {
      return null;
    }

    return {
      ...updatedUser,
      vehicleCount: vehicleCountResult[0].vehicleCount,
    } as unknown as UserWithVehicleCount; 
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to block user: ${(error as Error).message}`);
  }
}

async findByEmailOrMobile(email: string, mobile: string): Promise<boolean> {
  const user = await super.findOne({ $or: [{ email }, { mobile }] });
  return !!user; 
}


}