import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { inject, injectable } from "tsyringe";
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IGetDriverProfile } from "./interfaces/IGetDriverProfile";
import { DriverFullResponseDto, toDriverFullResponse } from "../../dto/driver/DriverResponseDto";

@injectable()
export class GetDriverProfile implements IGetDriverProfile{
  constructor(
    @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository
  ) {}

  async execute(driverId: string): Promise<DriverFullResponseDto|null> {
    if (!driverId) {
        throw new AuthError(ERROR_MESSAGES.DRIVER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST);
    }

    const driver = await this._driverRepository.findDriverById(driverId);
    if (!driver) {
      throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND,HTTP_STATUS_CODES.NOT_FOUND);
    }

    return toDriverFullResponse(driver);
  }
}
