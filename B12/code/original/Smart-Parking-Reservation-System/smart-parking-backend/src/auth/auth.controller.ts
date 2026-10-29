import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register-admin')
  registerAdmin(@Body() registerDto: RegisterDto) {
    return this.authService.registerAdmin(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetData: ResetPasswordDto) {
    return this.authService.resetPassword(resetData);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(
      req.user.id,
      dto.fullName,
      dto.phoneNumber,
      dto.defaultVehicleNumber,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
