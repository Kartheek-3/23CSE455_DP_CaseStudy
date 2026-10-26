import { inject, injectable } from "tsyringe";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository"; 
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IBlockOrUnblockDriverUseCase } from "./Interfaces/IBlockOrUnblockDriverUseCase";

@injectable()
export class BlockOrUnblockDriver implements IBlockOrUnblockDriverUseCase {
  constructor(
    @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository
  ) {}

  async execute(driverId: string, isBlock: boolean): Promise<void> {
    
    const driver = await this._driverRepository.findDriverById(driverId);
    if (!driver) {
        throw new AuthError("Driver not found",HTTP_STATUS_CODES.NOT_FOUND);
      }
      

    await this._driverRepository.blockOrUnblockDriver(driverId, isBlock);
  }
}
