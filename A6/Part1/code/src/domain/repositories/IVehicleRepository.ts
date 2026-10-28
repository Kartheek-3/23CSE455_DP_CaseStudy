import { Vehicle } from "../models/Vehicle";

export interface IVehicleRepository {
    addVehicle(vehicleData: Vehicle): Promise<Vehicle>;
    editVehicle(vehicleId: string, updateData: Partial<Vehicle>): Promise<Vehicle | null>;
    getVehicleById(vehicleId: string): Promise<Vehicle | null>;
    getVehiclesByUser(userId: string): Promise<Vehicle[]>;
    deleteVehicle(vehicleId: string): Promise<boolean>;
    findAll(): Promise<Vehicle[]>; 
}
