import { FindNearbyDriversResult } from "../../../dto/driver/DriverResponseDto";

export interface INearbyDriverUseCase {
  execute(
    userId: string,
    page?: number,
    limit?: number,
    placeKey?: string
  ): Promise<FindNearbyDriversResult>;
}
