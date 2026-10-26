import { VehicleResponseDto } from "../../../dto/vehicle/VehicleResponseDto";

export interface IGetVehiclesByUserUseCase {
  execute(userId: string): Promise<VehicleResponseDto[]>;
}
