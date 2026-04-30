import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';

export enum UserRole {
  SUPERADMIN = 'superadmin',
  TENANTADMIN = 'tenantadmin',
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

export class CreateProfileDto {
  @IsUUID()
  id: string;

  @IsUUID()
  tenant_id: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
