import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Profile, ProfileDocument } from '../models/profile.schema';
import { Tenant, TenantDocument } from '../models/tenant.schema';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
  full_name: string;
  tenantName: string;
  tenantSlug: string;
  avatar_url: string | null;
}

export interface RegistrationResult extends AuthenticatedUser {}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectModel(Profile.name) private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
  ) {}

  async onModuleInit() {
    await this.seedDemoTenant();
  }

  private async seedDemoTenant() {
    const tenantSlug = 'amdox';
    const tenantName = 'Amdox Corporation';
    const email = 'admin@amdox.com';
    const password = 'password';

    let tenant = await this.tenantModel.findOne({ slug: tenantSlug }).exec();
    if (!tenant) {
      tenant = await this.tenantModel.create({
        name: tenantName,
        slug: tenantSlug,
        status: 'active',
      });
    }

    const existingProfile = await this.profileModel.findOne({ email }).exec();
    if (!existingProfile) {
      const passwordHash = await bcrypt.hash(password, 10);
      await this.profileModel.create({
        tenantId: tenant.id,
        fullName: 'System Administrator',
        email,
        role: 'superadmin',
        avatarUrl: null,
        isActive: true,
        passwordHash,
      });
    }
  }

  async validateUser(email: string, password: string): Promise<AuthenticatedUser | null> {
    const profile = await this.profileModel.findOne({ email: email.toLowerCase() }).exec();
    if (!profile || profile.isActive === false || !profile.passwordHash) {
      return null;
    }

    const isValid = await bcrypt.compare(password, profile.passwordHash);
    if (!isValid) {
      return null;
    }

    const tenant = await this.tenantModel.findById(profile.tenantId).exec();
    if (!tenant) {
      return null;
    }

    await this.profileModel.updateOne(
      { _id: profile._id },
      { lastLoginAt: new Date() },
    );

    return {
      userId: profile.id,
      email: profile.email,
      tenantId: profile.tenantId,
      role: profile.role,
      full_name: profile.fullName,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      avatar_url: profile.avatarUrl ?? null,
    };
  }

  async registerTenantAdmin(input: {
    fullName: string;
    email: string;
    password: string;
    tenantName: string;
    tenantSlug: string;
    avatarUrl?: string;
  }): Promise<RegistrationResult> {
    const normalizedEmail = input.email.toLowerCase();
    const normalizedSlug = input.tenantSlug.toLowerCase();

    const existingTenant = await this.tenantModel.findOne({ slug: normalizedSlug }).exec();
    if (existingTenant) {
      throw new Error('Organization slug is already in use');
    }

    const existingProfile = await this.profileModel.findOne({ email: normalizedEmail }).exec();
    if (existingProfile) {
      throw new Error('Email is already registered');
    }

    const tenant = await this.tenantModel.create({
      name: input.tenantName,
      slug: normalizedSlug,
      status: 'active',
    });

    const passwordHash = await bcrypt.hash(input.password, 10);
    const profile = await this.profileModel.create({
      tenantId: tenant.id,
      fullName: input.fullName,
      email: normalizedEmail,
      avatarUrl: input.avatarUrl ?? null,
      role: 'tenantadmin',
      isActive: true,
      passwordHash,
    });

    return {
      userId: profile.id,
      email: profile.email,
      tenantId: profile.tenantId,
      role: profile.role,
      full_name: profile.fullName,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      avatar_url: profile.avatarUrl ?? null,
    };
  }

  async findProfileByEmail(email: string) {
    const profile = await this.profileModel.findOne({ email: email.toLowerCase() }).exec();
    if (!profile) return null;

    const tenant = await this.tenantModel.findById(profile.tenantId).exec();
    return {
      id: profile.id,
      tenant_id: profile.tenantId,
      full_name: profile.fullName,
      email: profile.email,
      avatar_url: profile.avatarUrl ?? null,
      role: profile.role,
      tenant_name: tenant?.name ?? null,
      tenant_slug: tenant?.slug ?? null,
    };
  }
}
