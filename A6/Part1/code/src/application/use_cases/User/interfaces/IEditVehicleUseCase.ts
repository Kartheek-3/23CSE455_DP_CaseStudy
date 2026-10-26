import { VehicleResponseDto } from "../../../dto/vehicle/VehicleResponseDto"; 
export interface IEditVehicleUseCase {
  execute(vehicleId: string, updateData: any): Promise<VehicleResponseDto | null>;
}