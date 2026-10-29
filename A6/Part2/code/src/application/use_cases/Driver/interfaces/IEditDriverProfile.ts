import { DriverFullResponseDto } from "../../../dto/driver/DriverResponseDto";

export interface IEditDriverProfile {
  execute(driverId: string, updateData: any): Promise<DriverFullResponseDto | null>;
}
