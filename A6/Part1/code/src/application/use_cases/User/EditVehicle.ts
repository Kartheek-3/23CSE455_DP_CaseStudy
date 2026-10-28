import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository";
import { inject, injectable } from "tsyringe";
import { AuthError } from "../../../domain/errors/Autherror";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { TOKENS } from "../../../constants/Tokens";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { IEditVehicleUseCase } from "./interfaces/IEditVehicleUseCase";
import { VehicleResponseDto, toVehicleResponse } from "../../dto/vehicle/VehicleResponseDto";

@injectable()
export class EditVehicle implements IEditVehicleUseCase {
  constructor(
    @inject(TOKENS.VEHICLE_REPO) private _vehicleRepository: IVehicleRepository
  ) {}

  async execute(vehicleId: string, updateData: any): Promise<VehicleResponseDto|null> {
    if (!vehicleId) {
        throw new AuthError(ERROR_MESSAGES.VIHICLE_ID_MISS, HTTP_STATUS_CODES.BAD_REQUEST); 
      }
    
    const updatedVehicle = await this._vehicleRepository.editVehicle(vehicleId, updateData);
    if (!updatedVehicle) {
        throw new AuthError(ERROR_MESSAGES.VEHICLE_UPDATE_FAILE ,HTTP_STATUS_CODES.NOT_FOUND); 
      }

    return toVehicleResponse(updatedVehicle);
  }
}
