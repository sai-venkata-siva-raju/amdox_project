import { Injectable } from '@nestjs/common';

@Injectable()
export class TenantsService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id, name: 'Test Tenant' };
  }
}
