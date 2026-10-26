import { AdminDriverResponseDto } from "../../../dto/admin/AdminResponseDto";
import { DriverAccountStatus } from "../../../../domain/driver/DriverAccountState";

export interface IAdminChangeDriverStatusUseCase {
  execute(
    driverId: string,
    status: DriverAccountStatus,
    reason?: string
  ): Promise<AdminDriverResponseDto | null>
}
