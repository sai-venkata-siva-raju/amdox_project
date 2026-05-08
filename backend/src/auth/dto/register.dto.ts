import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  tenantName: string;

  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9-]+$/)
  tenantSlug: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
