import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../models/tenant.schema';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
  ) {}

  async findAll() {
    return this.tenantModel.find().sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    const tenant = await this.tenantModel.findById(id).lean().exec();
    if (tenant) return tenant;
    return { id, name: 'Test Tenant' };
  }
}
