import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IBlockUserUseCase } from "./Interfaces/IBlockUserUseCase";
import { AdminUserResponseDto, toAdminUserResponse } from "../../dto/admin/AdminResponseDto";

@injectable()
export class BlockUserUseCase implements IBlockUserUseCase {
  constructor(
    @inject(TOKENS.IUSER_REPO)
    private readonly _userRepository: IUserRepository
  ) {}

  async execute(userId: string, status: boolean): Promise<AdminUserResponseDto | null> {
    const blockedUser = await this._userRepository.blockOrUnblockUser(userId, status);
    
    if (!blockedUser) {
      throw new AuthError("User not found or already in the desired block status", HTTP_STATUS_CODES.NOT_FOUND);
    }

    return toAdminUserResponse(blockedUser);
  } 
}
