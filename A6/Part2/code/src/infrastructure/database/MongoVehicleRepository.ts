import { VehicleModel, VehicleDocument } from "./modals/VehicleSchema";
import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository"; 
import { Vehicle } from "../../domain/models/Vehicle"; 
import { injectable } from "tsyringe";
import { Types, Document } from "mongoose";

import { BaseRepository } from "./BaseRepository";

@injectable()
export class MongoVehicleRepository extends BaseRepository<Vehicle, VehicleDocument> implements IVehicleRepository {
  constructor() {
    super(VehicleModel);
  }

    async addVehicle(vehicleData: Vehicle): Promise<Vehicle> {
        return super.create(vehicleData);
    }
    
      // Edit vehicle details (partial update)
      async editVehicle(vehicleId: string, updateData: Partial<Vehicle>): Promise<Vehicle | null> {
        if (!Types.ObjectId.isValid(vehicleId)) return null;
        return super.update(vehicleId, updateData);
      }
    
      // Get a vehicle by its ID
      async getVehicleById(vehicleId: string): Promise<Vehicle | null> {
        if (!Types.ObjectId.isValid(vehicleId)) return null;
        return super.findById(vehicleId);
      }
    
      // Get all vehicles registered by a specific user
      async getVehiclesByUser(userId: string): Promise<Vehicle[]> {
        if (!Types.ObjectId.isValid(userId)) return [];
        return super.findAll({ userId });
      }
    
      // Delete a vehicle by ID
      async deleteVehicle(vehicleId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(vehicleId)) return false;
        return super.delete(vehicleId);
      }
}
