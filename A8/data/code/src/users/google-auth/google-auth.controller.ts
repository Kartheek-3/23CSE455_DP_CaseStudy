import { Controller, Get, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from '../guards/googleAuth.guard';

@Controller('/api/auth')
export class GoogleAuthController {
  @UseGuards(GoogleAuthGuard)
  @Get('/google/login')
  loginUser() {
    return { msg: 'successful login' };
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/redirect')
  handleRedirect() {
    return { msg: ' Redicrect successful' };
  }

  @Get('/google/test')
  hangleTest() {
    return { msg: 'successfuly login' };
  }
}
