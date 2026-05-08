import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('profiles-test')
@Controller('profiles-test')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TestProfilesController {
  
  @Get()
  @ApiOperation({ summary: 'Test endpoint for profiles' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  getTest(@Request() req) {
    return {
      message: 'Test endpoint working',
      user: req.user,
      tenantId: req.user.tenantId,
    };
  }

  @Get('direct')
  @ApiOperation({ summary: 'Direct database query test' })
  @ApiResponse({ status: 200, description: 'Direct query successful' })
  async getDirectQuery() {
    // For now, return mock data to test the integration
    return [
      {
        id: 'a0000000-0000-0000-0000-000000000002',
        tenant_id: 'a0000000-0000-0000-0000-000000000001',
        email: 'admin@amdox.com',
        full_name: 'System Administrator',
        avatar_url: null,
        role: 'superadmin',
        created_at: new Date().toISOString()
      }
    ];
  }
}
