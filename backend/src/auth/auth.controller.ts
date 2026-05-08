import { Controller, Post, Body, Get, UseGuards, Request, ConflictException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  login(@Request() req) {
    const user = req.user;
    const payload = {
      sub: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.userId,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        tenant_id: user.tenantId,
        tenant_name: user.tenantName,
        tenant_slug: user.tenantSlug,
        avatar_url: user.avatar_url,
      }
    };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register organization and tenant admin account' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.authService.registerTenantAdmin({
        fullName: registerDto.fullName,
        email: registerDto.email,
        password: registerDto.password,
        tenantName: registerDto.tenantName,
        tenantSlug: registerDto.tenantSlug,
        avatarUrl: registerDto.avatarUrl,
      });

      const token = this.jwtService.sign({
        sub: user.userId,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.userId,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          tenant_id: user.tenantId,
          tenant_name: user.tenantName,
          tenant_slug: user.tenantSlug,
          avatar_url: user.avatar_url,
        },
      };
    } catch (error) {
      throw new ConflictException(
        error instanceof Error ? error.message : 'Registration failed',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiBearerAuth()
  getProfile(@Request() req) {
    return this.authService.findProfileByEmail(req.user.email);
  }
}
