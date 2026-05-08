import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('profiles')
@Controller('profiles')
@UseGuards(JwtAuthGuard, TenantScopeGuard)
@ApiBearerAuth()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @Roles('superadmin', 'tenantadmin')
  @ApiOperation({ summary: 'Create a new profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully.' })
  create(@Body() createProfileDto: CreateProfileDto, @Request() req) {
    return this.profilesService.create({
      ...createProfileDto,
      tenant_id: req.user.tenantId,
    });
  }

  @Get()
  @Roles('superadmin', 'tenantadmin', 'manager')
  @ApiOperation({ summary: 'Get all profiles for current tenant' })
  @ApiResponse({ status: 200, description: 'List of profiles retrieved.' })
  findAll(@Request() req) {
    return this.profilesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @Roles('superadmin', 'tenantadmin', 'manager')
  @ApiOperation({ summary: 'Get a specific profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.profilesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('superadmin', 'tenantadmin')
  @ApiOperation({ summary: 'Update a profile' })
  @ApiResponse({ status: 200, description: 'Profile updated.' })
  update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto, @Request() req) {
    return this.profilesService.update(id, req.user.tenantId, updateProfileDto);
  }

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Delete a profile' })
  @ApiResponse({ status: 200, description: 'Profile deleted.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.profilesService.remove(id, req.user.tenantId);
  }
}
