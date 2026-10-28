import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { AuthError } from "../../../domain/errors/Autherror"; 
import { TOKENS } from "../../../constants/Tokens";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IUpdateUserData } from "./interfaces/IUpdateUserData";
import { UpdateUserRequestDto } from "../../dto/user/UserRequestDto";
import { UserResponseDto, toUserResponse } from "../../dto/user/UserResponseDto";

@injectable()
export class UpdateUserData implements IUpdateUserData  {
  constructor(
    @inject(TOKENS.IUSER_REPO) private _userRepository: IUserRepository
  ) {}

  async execute(userId: string, updateData: UpdateUserRequestDto): Promise<UserResponseDto>{
    if (!userId) {
      throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND, HTTP_STATUS_CODES.BAD_REQUEST);
    }

    const user = await this._userRepository.getUserById(userId);
    if (!user) {
      throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }

    const updatedUser = await this._userRepository.updateUser(userId, updateData);
    if (!updatedUser) {
      throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }
    
    return toUserResponse(updatedUser);
  }
}
