import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtService } from '@nestjs/jwt';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  login(@Request() req) {
    const user = req.user;
    const payload = { 
      sub: user.userId, 
      email: user.email,
      tenantId: 'a0000000-0000-0000-0000-000000000001',
      role: 'superadmin'
    };
    
    const token = this.jwtService.sign(payload);
    
    return {
      token,
      user: {
        id: 'a0000000-0000-0000-0000-000000000002',
        email: user.email,
        full_name: 'System Administrator',
        role: 'superadmin',
        tenant_id: 'a0000000-0000-0000-0000-000000000001',
        tenant_name: 'Amdox Corporation',
        tenant_slug: 'amdox',
        avatar_url: null
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiBearerAuth()
  getProfile(@Request() req) {
    return {
      id: 'a0000000-0000-0000-0000-000000000002',
      email: req.user.email,
      full_name: 'System Administrator',
      role: 'superadmin',
      tenant_id: 'a0000000-0000-0000-0000-000000000001',
      tenant_name: 'Amdox Corporation',
      tenant_slug: 'amdox',
      avatar_url: null
    };
  }
}
