import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/repositories/IUserepository"; 
import { IDriverRepository } from "../../../domain/repositories/IDriverepository"; 
import { IHashService} from "../../services/HashService"; 
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { IChangePasswordUseCase } from "./interface/IChangePasswordUseCase";


@injectable()
export class ChangePassword implements IChangePasswordUseCase {
  constructor(
    @inject(TOKENS.IUSER_REPO) private _userRepository: IUserRepository,
    @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository,
    @inject(TOKENS.HASH_SERVICE) private _hashService: IHashService
  ) {}

  async execute(userId: string, oldPassword: string, newPassword: string, role: "user" | "driver" | "admin"): Promise<void> {
    let account;

    // Fetch account based on role
    if (role === "user" || role === "admin") {
      account = await this._userRepository.getUserById(userId);
    } else {
      account = await this._driverRepository.findDriverById(userId);
    }

    if (!account) {
        throw new AuthError(ERROR_MESSAGES.ACCOUNT_NOTFOUND, HTTP_STATUS_CODES.NOT_FOUND); // 404 Not Found
      }
 
    const isPasswordValid = await this._hashService.compare(oldPassword, account.password);
  
if (!isPasswordValid) {
    throw new AuthError(ERROR_MESSAGES.INCORRECT_CURRENT_PASSWORD, HTTP_STATUS_CODES.BAD_REQUEST); // 400 Bad Request
  }
   
  
    if (role === "user" || role === "admin") {
      await this._userRepository.updateUser(userId, { password: newPassword });
    } else {
      await this._driverRepository.update(userId, { password: newPassword });
    }
  }
}
