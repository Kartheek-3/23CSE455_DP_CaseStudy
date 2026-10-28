import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../../../domain/repositories/IUserepository';
import { AuthError } from '../../../domain/errors/Autherror'; 
import { inject, injectable } from 'tsyringe';
import { IRedisrepository } from '../../../domain/repositories/IRedisrepository';
import { IDriverRepository } from '../../../domain/repositories/IDriverepository';
import { EmailService } from '../../services/Emailservice';
import { TOKENS } from '../../../constants/Tokens';
import { ERROR_MESSAGES } from '../../../constants/ErrorMessages';
import { HTTP_STATUS_CODES } from '../../../constants/HttpStatusCode';
import { IForgotPasswordUseCase } from './interface/IForgotPasswordUseCase';
@injectable()
export class ForgotPasswordUseCase implements  IForgotPasswordUseCase  {
  constructor(
    @inject(TOKENS.USER_REGISTERSTORE) private _store: IRedisrepository,
    @inject(TOKENS.IUSER_REPO) private _userRepository: IUserRepository,
    @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository,
    @inject(TOKENS.EMAIL_SERVICE) private _emailService: EmailService,
  ) {}

  async execute(email: string,role:'user'|'driver' | 'admin'):Promise<void> {
    let user;
    console.log(email,role);
    
    if(role=='user' || role == 'admin'){
     user= await this._userRepository.findByEmail(email);
    if (!user) throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND,HTTP_STATUS_CODES.NOT_FOUND);
    }
    if(role=='driver'){
        user= await this._driverRepository.findByEmail(email);
       
        
    if (!user) throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND); 
    }

    // Generate token
    const token = uuidv4();
   
    if (user?._id)   this._store.addTokenUser(role, token, user._id.toString()); 
     
     
      

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&role=${role}`;

   

  
     if(user?.email)   await this._emailService.sendForgotPasswordLink(user?.email,resetLink)
 

   
  }
}
