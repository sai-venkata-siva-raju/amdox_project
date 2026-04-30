import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  validateUser(email: string, password: string): any {
    // Simplified validation - in production, you'd check against database
    if (email === 'admin@amdox.com' && password === 'password') {
      return {
        userId: 'a0000000-0000-0000-0000-000000000002',
        email: 'admin@amdox.com',
        tenantId: 'a0000000-0000-0000-0000-000000000001',
        role: 'superadmin',
      };
    }
    return null;
  }
}
