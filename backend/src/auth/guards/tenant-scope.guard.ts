import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TenantScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    if (!user) {
      throw new ForbiddenException('Tenant context missing');
    }

    request.tenantId = user.tenantId || user.tenant_id;

    const candidateTenantIds = [
      request.params?.tenantId,
      request.params?.tenant_id,
      request.query?.tenantId,
      request.query?.tenant_id,
      request.body?.tenantId,
      request.body?.tenant_id,
    ].filter(Boolean);

    if (candidateTenantIds.length > 0) {
      const matches = candidateTenantIds.every(
        (value) => String(value) === String(request.tenantId),
      );
      if (!matches) {
        throw new ForbiddenException('Cross-tenant access is not allowed');
      }
    }

    return true;
  }
}
