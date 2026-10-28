import { inject, injectable } from "tsyringe";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { GoogleDistanceService } from "../../services/GoogleDistanceService";
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { DriverResponseDto } from "../../dto/driver/DriverResponseDto";
import { IGetNearbyDriverDetailsUseCase } from "../Interfaces/IGetNearbyDriverDetailsUseCase"; 
import { toDriverResponse } from "../../dto/driver/DriverResponseDto";
import { Driver } from "../../../domain/models/Driver";

@injectable()
export class GetNearbyDriverDetails
  implements IGetNearbyDriverDetailsUseCase
{
  constructor(
    @inject(TOKENS.IDRIVER_REPO)
    private _driverRepository: IDriverRepository,
    @inject(TOKENS.IUSER_REPO)
    private _userRepository: IUserRepository,
    @inject(TOKENS.GOOGLE_DISTANCE_SERVICE)
    private _distanceService: GoogleDistanceService
  ) {}

  async execute(userId: string, driverId: string, lat?: number, lng?: number): Promise<DriverResponseDto> {
    let latitude = lat;
    let longitude = lng;

    // 1️⃣ Fetch the user's location from the database if not provided
    if (latitude === undefined || longitude === undefined) {
      
      const user = await this._userRepository.getUserById(userId);
     
      if (!user?.location) {
        throw new AuthError("User location not found. Please provide coordinates or update your profile.", HTTP_STATUS_CODES.BAD_REQUEST);
      }
      latitude = user.location.latitude;
      longitude = user.location.longitude;
    }
    // 2️⃣ Fetch the specific driver directly
    const driver = await this._driverRepository.findDriverById(driverId);

    if (!driver) {
      throw new AuthError("Driver not found", HTTP_STATUS_CODES.NOT_FOUND);
    }

    // 3️⃣ Extract driver location for distance calculation
    const driverLocation = ('coordinates' in driver.location)
      ? {
          id: driverId,
          latitude: driver.location.coordinates[1],
          longitude: driver.location.coordinates[0],
        }
      : {
          id: driverId,
          latitude: driver.location.latitude,
          longitude: driver.location.longitude,
        };

    // 4️⃣ Get distance for this specific driver
    const distances = await this._distanceService.getDistances(
      { latitude, longitude },
      [driverLocation]
    );

    const distance = distances[driverId] || null;

    const driverData: Partial<Driver> & { distance: number | null } = {
      ...driver,
      distance
    };

    return toDriverResponse(driverData);
  }
}
