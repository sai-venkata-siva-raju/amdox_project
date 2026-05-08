import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type ProfileDocument = HydratedDocument<Profile>;

export const USER_ROLES = ['superadmin', 'tenantadmin', 'manager', 'viewer'] as const;
export type UserRole = (typeof USER_ROLES)[number];

@Schema({ timestamps: true, collection: 'profiles' })
export class Profile {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, trim: true, default: '' })
  fullName: string;

  @Prop({ required: true, trim: true, lowercase: true, index: true })
  email: string;

  @Prop({ default: null })
  avatarUrl?: string | null;

  @Prop({ required: true, enum: USER_ROLES, default: 'viewer', index: true })
  role: UserRole;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: null })
  passwordHash?: string | null;

  @Prop({ default: null })
  lastLoginAt?: Date | null;
}

export const ProfileSchema = applySchemaTransforms(SchemaFactory.createForClass(Profile));
ProfileSchema.index({ tenantId: 1, email: 1 }, { unique: true });
