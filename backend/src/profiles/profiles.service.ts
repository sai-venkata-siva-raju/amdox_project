import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument, UserRole } from '../models/profile.schema';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name)
    private readonly profilesRepository: Model<ProfileDocument>,
  ) {}

  async findAll(tenantId: string): Promise<any[]> {
    const profiles = await this.profilesRepository.find({ tenantId }).sort({ createdAt: -1 }).lean().exec();
    return profiles.map((profile) => this.toApiProfile(profile));
  }

  async findOne(id: string, tenantId: string): Promise<any> {
    const profile = await this.profilesRepository.findOne({ _id: id, tenantId }).lean().exec();
    return profile ? this.toApiProfile(profile) : null;
  }

  async create(profileData: Partial<any>): Promise<any> {
    const profile = await this.profilesRepository.create({
      tenantId: profileData.tenant_id || profileData.tenantId,
      fullName: profileData.full_name || profileData.fullName || '',
      email: (profileData.email || '').toLowerCase(),
      avatarUrl: profileData.avatar_url ?? profileData.avatarUrl ?? null,
      role: profileData.role || 'viewer',
    });
    return this.toApiProfile(profile.toJSON());
  }

  async update(id: string, tenantId: string, profileData: Partial<any>): Promise<any> {
    await this.profilesRepository.updateOne(
      { _id: id, tenantId },
      {
        ...(profileData.full_name || profileData.fullName ? { fullName: profileData.full_name || profileData.fullName } : {}),
        ...(profileData.email ? { email: profileData.email.toLowerCase() } : {}),
        ...(profileData.avatar_url !== undefined || profileData.avatarUrl !== undefined
          ? { avatarUrl: profileData.avatar_url ?? profileData.avatarUrl }
          : {}),
        ...(profileData.role ? { role: profileData.role as UserRole } : {}),
      },
    ).exec();
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    await this.profilesRepository.deleteOne({ _id: id, tenantId }).exec();
  }

  private toApiProfile(profile: any) {
    return {
      id: profile.id ?? profile._id?.toString(),
      tenant_id: profile.tenantId,
      full_name: profile.fullName,
      email: profile.email,
      avatar_url: profile.avatarUrl ?? null,
      role: profile.role,
      created_at: profile.createdAt ?? profile.created_at ?? new Date().toISOString(),
    };
  }
}
