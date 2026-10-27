import { AdminDriverResponseDto } from "../../../dto/admin/AdminResponseDto";

export interface IAdminChangeDriverStatusUseCase {
  execute(
    driverId: string,
    status: "pending" | "approved" | "rejected",
    reason?: string
  ): Promise<AdminDriverResponseDto | null>
}
