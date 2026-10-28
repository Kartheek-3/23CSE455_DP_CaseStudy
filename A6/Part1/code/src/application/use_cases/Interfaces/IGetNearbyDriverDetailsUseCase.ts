import { DriverResponseDto } from "../../dto/driver/DriverResponseDto";

export interface IGetNearbyDriverDetailsUseCase {
  execute(
    userId: string,
    driverId: string,
    lat?: number,
    lng?: number
  ): Promise<DriverResponseDto>;
}
