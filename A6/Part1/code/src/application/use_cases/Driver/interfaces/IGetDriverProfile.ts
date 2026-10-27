import { DriverFullResponseDto } from "../../../dto/driver/DriverResponseDto";

export interface IGetDriverProfile {
  execute(driverId: string): Promise<DriverFullResponseDto | null>;
}
