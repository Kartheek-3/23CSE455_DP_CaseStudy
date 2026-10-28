import { inject, injectable } from "tsyringe";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository"; 
import { IUserRepository } from "../../../domain/repositories/IUserepository"; 
import { GoogleDistanceService } from "../../services/GoogleDistanceService"; 
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { FindNearbyDriversResult } from "../../dto/driver/DriverResponseDto";
import { IFindNearbyDriversUseCase } from "./interfaces/IFindNearbyDriversUseCase";
import { DriverResponseDto, toDriverListResponse } from "../../dto/driver/DriverResponseDto";

@injectable()
export class FindNearbyDrivers implements IFindNearbyDriversUseCase{
  constructor(
    @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository,
    @inject(TOKENS.IUSER_REPO) private _userRepository: IUserRepository,
    @inject(TOKENS.GOOGLE_DISTANCE_SERVICE) private _distanceService: GoogleDistanceService
  ) {}

   async execute(userId: string, page: number = 1, limit: number = 2, placeKey?: string, lat?: number, lng?: number): Promise<FindNearbyDriversResult> {
    let latitude = lat;
    let longitude = lng;

    // 1️⃣ Fetch the user's location from the database if not provided
    if (latitude === undefined || longitude === undefined) {
      const user = await this._userRepository.getUserById(userId);
      if (!user) {
        throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
      }
      if (!user.location) {
        throw new AuthError(ERROR_MESSAGES.LOCATION_NOTFOUND, HTTP_STATUS_CODES.BAD_REQUEST);
      }
      latitude = user.location.latitude;
      longitude = user.location.longitude;
    }
    // 2️⃣ Use paginated driver fetching from repository
    const paginatedResult= await this._driverRepository.findActiveDrivers(
      page,
      limit,
      placeKey,
      latitude,
      longitude
    );
    const drivers = paginatedResult.data;

    if (drivers.length === 0) return { ...paginatedResult, data: [] };

    
    // 3️⃣ Extract driver locations
    const driverLocations = drivers.map((driver) => {
      if ('coordinates' in driver.location) {
        return {
          id: driver._id?.toString() || "",
          latitude: driver.location.coordinates[1],
          longitude: driver.location.coordinates[0],
        };
      } else {
        return {
          id: driver._id?.toString() || "",
          latitude: driver.location.latitude,
          longitude: driver.location.longitude,
        };
      }
    });

    // 4️⃣ Get distances
    const distances = await this._distanceService.getDistances(
      { latitude, longitude },
      driverLocations
      
    );

    // 5️⃣ Add distance to driver
    const driversWithDistance = drivers.map((driver) => {
      const driverId = driver._id?.toString();
      return {
        ...driver,
        distance: driverId ? distances[driverId] || null : null,
      };
    });
    console.log(driversWithDistance,'driverwith distance')
    // 6️⃣ Sort & return with pagination info
    const sortedDrivers = driversWithDistance.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    
    return {
      ...paginatedResult,
      data: toDriverListResponse(sortedDrivers),
    };
  }
  
}
