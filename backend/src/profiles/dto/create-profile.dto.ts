import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum UserRole {
  SUPERADMIN = 'superadmin',
  TENANTADMIN = 'tenantadmin',
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

export class CreateProfileDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  tenant_id?: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
