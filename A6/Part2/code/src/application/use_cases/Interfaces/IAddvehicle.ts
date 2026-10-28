import { VehicleResponseDto } from "../../dto/vehicle/VehicleResponseDto";

export interface IAddVehicleUseCase {
  execute(vehicleData: any): Promise<VehicleResponseDto>;
}
