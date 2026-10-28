import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../domain/repositories/IUserepository";
import { IDriverRepository } from "../../domain/repositories/IDriverepository";
import dotenv from "dotenv";
import { User } from "../../domain/models/User";
import { Driver } from "../../domain/models/Driver";
import { AuthService } from "../services/AuthService";
import { AuthError } from "../../domain/errors/Autherror";
import { IHashService } from "../services/HashService";
import { TOKENS } from "../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { ILogin } from "./Interfaces/ILogin";
import { LoginResponseDto } from "../dto/auth/AuthResponseDto";
dotenv.config();
@injectable()
export class Login implements ILogin {
  constructor(
    @inject(TOKENS.IUSER_REPO) private _userRepository: IUserRepository,
    @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository,
    @inject(TOKENS.HASH_SERVICE) private _hashService: IHashService
  ) {}
  async execute(
    email: string,
    password: string,
    role: "user" | "driver" | "admin"
  ): Promise<LoginResponseDto> {
    let user: User | Driver;

    // --- User / Admin login ---
    if (role === "user" || role === "admin") {
      const found = await this._userRepository.findByEmail(email);
      if (!found) {
        throw new AuthError(
          `${role} not found. Please register.`,
          HTTP_STATUS_CODES.UNAUTHORIZED
        );
      }
      user = found;
    }
    // --- Driver login ---
    else {
      const found = await this._driverRepository.findByEmail(email);
      if (!found) {
        throw new AuthError(
          "Driver not found. Please register.",
          HTTP_STATUS_CODES.UNAUTHORIZED
        );
      }
      if (found.status === "pending") {
        throw new AuthError(
          "Your account is under review. Please wait for approval.",
          HTTP_STATUS_CODES.FORBIDDEN
        );
      }
      if (found.status === "rejected") {
        throw new AuthError(
          "Your registration has been rejected. Please contact support.",
          HTTP_STATUS_CODES.FORBIDDEN
        );
      }
      user = found;
    }

    // --- Blocked check ---
    if (user.isBlock) {
      throw new AuthError(
        "Your account has been blocked. Please contact support.",
        HTTP_STATUS_CODES.FORBIDDEN
      );
    }

    // --- Password check ---
    const validPassword = await this._hashService.compare(
      password,
      user.password
    );
    if (!validPassword) {
      throw new AuthError(
        "Invalid email or password.",
        HTTP_STATUS_CODES.UNAUTHORIZED
      );
    }

    // --- Role check ---
    if (role !== user.role) {
      throw new AuthError(
        "Role mismatch. Please login with the correct role.",
        HTTP_STATUS_CODES.UNAUTHORIZED
      );
    }

    // --- Token generation ---
    const accessToken = AuthService.generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = AuthService.generateRefreshToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      role: user.role,
    };
  }
}
