
import { inject, injectable } from 'tsyringe';
import { IRedisrepository } from '../../../domain/repositories/IRedisrepository';
import { IUserRepository } from '../../../domain/repositories/IUserepository';
import { IDriverRepository } from '../../../domain/repositories/IDriverepository';
import { AuthError } from '../../../domain/errors/Autherror';
import { TOKENS } from '../../../constants/Tokens';
import { HTTP_STATUS_CODES } from '../../../constants/HttpStatusCode';
import { ERROR_MESSAGES } from '../../../constants/ErrorMessages';
import { IResetPasswordUseCase } from './interface/IResetPasswordUseCase';

@injectable()
export class ResetPasswordUseCase implements  IResetPasswordUseCase {
  constructor(
    @inject(TOKENS.USER_REGISTERSTORE) private _store: IRedisrepository,
    @inject(TOKENS.IUSER_REPO) private _userRepository: IUserRepository,
    @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository,
    
  ) {}

  async execute(token: string, newPassword: string, role: 'user' | 'driver' | 'admin'):Promise<void> {
    
    const userId = await this._store.getTokenUser(role, token);
 
    
    if (!userId) throw new AuthError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS_CODES.BAD_REQUEST);
   
 
    let user;
    if (role === 'user' || role === 'admin') {
      user = await this._userRepository.getUserById(userId);
      if (!user) throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    } else if (role === 'driver') {
      user = await this._driverRepository.findDriverById(userId);
      if (!user) throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }

   
    if (user) {
      
     

      const updatedData = {
        password: newPassword,
        
      };
     

      if (role === 'user' || role === 'admin') {
        if (user._id) {
        await this._userRepository.updateUser(user._id.toString(), updatedData);
  
        }
      } else if (role === 'driver') {
        if (user._id ) {
          await this._driverRepository.update(user._id.toString(), updatedData);
        }
      }

  
      // Remove token from Redis after successful password reset
      await this._store.removeTokenUser(role, token);

      
    } else {
      throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }
  }

}