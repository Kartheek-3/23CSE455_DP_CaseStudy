import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  defaultVehicleNumber?: string;
}
