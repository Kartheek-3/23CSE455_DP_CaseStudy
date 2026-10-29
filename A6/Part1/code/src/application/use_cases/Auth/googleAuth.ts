import { injectable, inject } from "tsyringe";
import { OAuth2Client } from "google-auth-library";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { AuthService } from "../../services/AuthService";
import { AuthError } from "../../../domain/errors/Autherror";
import dotenv from "dotenv";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";

dotenv.config();

@injectable()
export class GoogleAuthUseCase {
  private _client: OAuth2Client;

  constructor(
    @inject(TOKENS.IUSER_REPO) private _userRepository: IUserRepository,
    @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository
  ) {
    this._client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async execute(googleToken: string, role: "user" | "driver") {
    try {
      const ticket = await this._client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
 
      const payload = ticket.getPayload();
      if (!payload) throw new AuthError("Invalid Google token", HTTP_STATUS_CODES.BAD_REQUEST);

      const { email, given_name, sub: googleId } = payload;

      if (!email) throw new AuthError("Google account email is required", HTTP_STATUS_CODES.BAD_REQUEST);

      let user;

      if (role === "user") {
        user = await this._userRepository.findByEmail(email);

        if (!user) {
          // Register new user
          user = await this._userRepository.create({
              email,
              name: given_name|| "Google User",
              googleId,
              mobile: "", // Empty string as default
              password: '', // No password for Google users
              profile: "default-profile.png", // Default profile image
              role: "user",
              isBlock:false,
               lastSeen: new Date(),
              onlineStatus: "offline",
             
          });
          
        }
      } else if (role === "driver") {
        user = await this._driverRepository.findByEmail(email);

        if (!user) {
          throw new AuthError("Driver not registered. Please register manually.", HTTP_STATUS_CODES.UNAUTHORIZED);
        }
      }
      if(!user){
       throw new AuthError ('Not found user ',HTTP_STATUS_CODES.UNAUTHORIZED)
      }

      const accessToken = AuthService.generateAccessToken({
        id: user._id,
        email: user.email,
        role,
      });

      const refreshToken = AuthService.generateRefreshToken({
        id: user._id,
        email: user.email,
        role,
      });

      return { accessToken, refreshToken,success:true};
    } catch (error) {
      console.error(error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Google authentication failed", HTTP_STATUS_CODES.UNAUTHORIZED);
    }
  }
}
