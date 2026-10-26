import { AdminUserResponseDto } from "../../../dto/admin/AdminResponseDto";

export interface IGetAllUsersUseCase {
  execute(): Promise<AdminUserResponseDto[]>;
}

