import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from '../users/user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const { password, ...result } = user;
    return result;
  }

  async registerAdmin(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newAdmin = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const { password, ...adminWithoutPassword } = newAdmin;
    return {
      message: 'Admin account created successfully',
      user: adminWithoutPassword,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('this email is not registered');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('password is incorrect');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return {
        message:
          'If an account with that email exists, a reset code has been sent.',
      };
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 15);

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = expirationDate;
    await this.usersService.save(user);

    try {
      await this.mailService.sendPasswordResetEmail(user.email, resetCode);
    } catch (err) {
      console.error('Failed to send password reset email', err);
    }

    return {
      message:
        'If an account with that email exists, a reset code has been sent.',
    };
  }

  async resetPassword(resetData: ResetPasswordDto) {
    const { email, code, newPassword } = resetData;

    const user = await this.usersService.findByEmail(email);

    if (!user || user.resetPasswordCode !== code) {
      throw new BadRequestException('Invalid reset code.');
    }

    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      await this.usersService.save(user);

      throw new BadRequestException(
        'Reset code has expired. Please request a new one.',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;

    await this.usersService.save(user);

    return {
      message: 'Password has been successfully reset. You can now log in.',
    };
  }

  async updateProfile(
    userId: number,
    fullName?: string,
    phoneNumber?: string,
    defaultVehicleNumber?: string,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (defaultVehicleNumber !== undefined)
      user.defaultVehicleNumber = defaultVehicleNumber;

    await this.usersService.save(user);

    const { password, resetPasswordCode, resetPasswordExpires, ...result } =
      user;
    return result;
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersService.save(user);

    return { message: 'Password changed successfully' };
  }
}
