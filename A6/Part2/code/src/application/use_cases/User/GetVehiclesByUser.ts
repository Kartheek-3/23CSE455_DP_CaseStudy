import { injectable, inject } from "tsyringe";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository";
import { TOKENS } from "../../../constants/Tokens";
import { IGetVehiclesByUserUseCase } from "./interfaces/IGetVehiclesByUserUseCase";
import { VehicleResponseDto, toVehicleListResponse } from "../../dto/vehicle/VehicleResponseDto";

@injectable()
export class GetVehiclesByUser implements IGetVehiclesByUserUseCase{
  constructor(
    @inject(TOKENS.VEHICLE_REPO) private _vehicleRepository: IVehicleRepository
  ) {}

  async execute(userId: string): Promise<VehicleResponseDto[]> {
    const vehicles = await this._vehicleRepository.getVehiclesByUser(userId);
    return toVehicleListResponse(vehicles);
  }
}
