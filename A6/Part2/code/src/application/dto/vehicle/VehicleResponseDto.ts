import { Vehicle } from "../../../domain/models/Vehicle";

/**
 * Vehicle Response DTO
 */
export interface VehicleResponseDto {
  _id: string;
  userId: string;
  vehicleImage: string;
  rcBookImage: string;
  Register_No: string;
  ownerName: string;
  vehicleName: string;
  vehicleType: string;
  polution_expire: string;
}

/**
 * Mapper: Domain Entity -> VehicleResponseDto
 */
export const toVehicleResponse = (vehicle: Vehicle): VehicleResponseDto => {
  return {
    _id: vehicle._id?.toString() || "",
    userId: vehicle.userId?.toString() || "",
    vehicleImage: vehicle.vehicleImage || "",
    rcBookImage: vehicle.rcBookImage || "",
    Register_No: vehicle.Register_No || "",
    ownerName: vehicle.ownerName || "",
    vehicleName: vehicle.vehicleName || "",
    vehicleType: vehicle.vehicleType || "",
    polution_expire: vehicle.polution_expire ? vehicle.polution_expire.toISOString() : "",
  };
};

/**
 * Mapper: Array of Domain Entities -> Array of VehicleResponseDto
 */
export const toVehicleListResponse = (vehicles: Vehicle[]): VehicleResponseDto[] => {
  return vehicles.map(toVehicleResponse);
};
