import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
  ) {}

  async findAll(tenantId: string): Promise<Profile[]> {
    return this.profilesRepository.find({
      where: { tenant_id: tenantId },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Profile> {
    return this.profilesRepository.findOne({
      where: { id, tenant_id: tenantId },
    });
  }

  async create(profileData: Partial<Profile>): Promise<Profile> {
    const profile = this.profilesRepository.create(profileData);
    return this.profilesRepository.save(profile);
  }

  async update(id: string, tenantId: string, profileData: Partial<Profile>): Promise<Profile> {
    await this.profilesRepository.update({ id, tenant_id: tenantId }, profileData);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    await this.profilesRepository.delete({ id, tenant_id: tenantId });
  }
}
