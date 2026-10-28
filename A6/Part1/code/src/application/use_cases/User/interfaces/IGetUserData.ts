import { UserResponseDto } from "../../../dto/user/UserResponseDto";

export interface IGetUserData {
  execute(userId: string): Promise<UserResponseDto>; 
}
