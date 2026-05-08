import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({ status: 200, description: 'List of tenants' })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @Roles('superadmin', 'tenantadmin')
  @ApiOperation({ summary: 'Get a specific tenant' })
  @ApiResponse({ status: 200, description: 'Tenant retrieved' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }
}
