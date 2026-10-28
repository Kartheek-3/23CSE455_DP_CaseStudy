import { AdminUserResponseDto } from "../../../dto/admin/AdminResponseDto";

export interface IBlockUserUseCase {
  execute(userId: string, status: boolean): Promise<AdminUserResponseDto | null>
}
