import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { TOKENS } from "../../../constants/Tokens";
import { IGetAllUsersUseCase } from "./Interfaces/IGetAllUsersUseCase";
import { AdminUserResponseDto, toAdminUserListResponse } from "../../dto/admin/AdminResponseDto";

@injectable()
export class GetAllUsers implements IGetAllUsersUseCase  {
  constructor(
    @inject(TOKENS.IUSER_REPO) private _userRepository: IUserRepository,
  ) {}

  async execute(): Promise<AdminUserResponseDto[]> {
    const users = await this._userRepository.getUsers();
    return toAdminUserListResponse(users || []);
  }
}