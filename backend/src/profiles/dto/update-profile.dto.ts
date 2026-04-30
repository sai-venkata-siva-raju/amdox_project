import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateProfileDto, UserRole } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
