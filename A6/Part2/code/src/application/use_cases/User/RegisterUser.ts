import { inject, injectable } from "tsyringe";
import { EmailService } from "../../services/Emailservice"; 
import { IRedisrepository } from "../../../domain/repositories/IRedisrepository";
import { User } from "../../../domain/models/User";
import { AuthError } from "../../../domain/errors/Autherror";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { TOKENS } from "../../../constants/Tokens";
import { IRegisterUser } from "./interfaces/IRegisterUser";
import { INFO_MESSAGES } from "../../../constants/Info_Messages";
@injectable()
export class RegisterUser implements IRegisterUser {
  constructor(
    @inject(TOKENS.EMAIL_SERVICE) private _emailService: EmailService,
    @inject(TOKENS.USER_REGISTERSTORE) private _store: IRedisrepository,
      @inject(TOKENS.IUSER_REPO) private _userRepository: IUserRepository,
) {}

  async execute(userData: User):Promise<{ message: string }>  {
    const { name, email, mobile, password, referralCode } = userData;
   
   const CheckExistingUser = await this._userRepository.findByEmailOrMobile(email,mobile);

   if(CheckExistingUser) {
     throw new AuthError(ERROR_MESSAGES.EMAIL_OR_MOBILE_EXIST, HTTP_STATUS_CODES.CONFLICT);
     
   }
   
 
    if (await this._store.getUser(email)) {
      await this._store.removeUser(email)
   
  }
  
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await this._store.addUser(email, { name, email, mobile, password, referralCode, otp, otpExpires });
 console.log(otp,'ypur otp')
    await this._emailService.sendOTP(email, otp);
    

    return { message: INFO_MESSAGES.USER.OTP };
  }
  
}
