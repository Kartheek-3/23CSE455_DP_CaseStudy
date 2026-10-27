import { UpdateUserRequestDto } from "../../../dto/user/UserRequestDto";
import { UserResponseDto } from "../../../dto/user/UserResponseDto";

export interface IUpdateUserData {
  execute(userId: string, updateData: UpdateUserRequestDto): Promise<UserResponseDto>;
}
