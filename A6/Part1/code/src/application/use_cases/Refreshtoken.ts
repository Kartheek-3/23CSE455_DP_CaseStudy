import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../constants/Tokens";
import { IUserRepository } from "../../domain/repositories/IUserepository";
import { IDriverRepository } from "../../domain/repositories/IDriverepository";
import { AuthService } from "../services/AuthService";
import { AuthError } from "../../domain/errors/Autherror";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { IRefreshTokenUseCase } from "./Interfaces/IRefreshTokenUseCase";

@injectable()
export class RefreshToken implements IRefreshTokenUseCase {
  constructor(
    @inject(TOKENS.IUSER_REPO) private _userRepository: IUserRepository,
    @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository
  ) {}

  async execute(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new AuthError(ERROR_MESSAGES.REFRESHTOKEN_NOTFOUND, HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    // 1. Verify and Decode token using the AuthService
    const decoded = AuthService.verifyToken(refreshToken, "refresh");
    
    if (!decoded || !decoded.role) {
       throw new AuthError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    const { role } = decoded;

    // 2. Fetch User based on role found in the token
    let user: any = null;
    if (role === "user" || role === "admin") {
      user = await this._userRepository.findByEmail(decoded.email);
      
      if (!user) {
        throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
      }

      // Verify if admin role is actually authorized
      if (role === "admin" && user.role !== "admin") {
        throw new AuthError(ERROR_MESSAGES.NOT_AUTHORIZED_ADMIN, HTTP_STATUS_CODES.FORBIDDEN);
      }
    } else if (role === "driver") {
      user = await this._driverRepository.findByEmail(decoded.email);
      
      if (!user) {
        throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
      }
    }

    // 3. Generate new Access Token
    return AuthService.generateAccessToken({ 
      id: user._id || user.id, 
      email: user.email, 
      role 
    });
  }
}
