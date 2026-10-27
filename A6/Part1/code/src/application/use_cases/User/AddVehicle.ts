import { inject, injectable } from "tsyringe";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository";
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IAddVehicleUseCase } from "../Interfaces/IAddvehicle";
import { VehicleResponseDto, toVehicleResponse } from "../../dto/vehicle/VehicleResponseDto";

@injectable()
export class AddVehicle implements IAddVehicleUseCase {
  constructor(
    @inject(TOKENS.VEHICLE_REPO) private _vehicleRepository: IVehicleRepository
  ) {}

  async execute(vehicleData: any): Promise<VehicleResponseDto> {
    // List of required fields
    const requiredFields = [
      "userId",
      "vehicleImage",
      "rcBookImage",
      "Register_No",
      "ownerName",
      "vehicleName",
      "vehicleType",
      "polution_expire",
    ];

    // Check if any field is missing
    for (const field of requiredFields) {
      if (!vehicleData[field]) {
        throw new AuthError(`${field} is required`, HTTP_STATUS_CODES.BAD_REQUEST);
      }
    }

    // Save vehicle if all validations pass
    const savedVehicle = await this._vehicleRepository.addVehicle(vehicleData);
    return toVehicleResponse(savedVehicle);
  }
}
