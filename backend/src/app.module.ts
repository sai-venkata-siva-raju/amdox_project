import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { ProfilesModule } from './profiles/profiles.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FinanceModule } from './finance/finance.module';
import { HrModule } from './hr/hr.module';
import { SupplyChainModule } from './supply-chain/supply-chain.module';
import { ProjectsModule } from './projects/projects.module';
import { BiModule } from './bi/bi.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { TenantScopeGuard } from './auth/guards/tenant-scope.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          configService.get<string>('MONGO_URL') ||
          'mongodb://127.0.0.1:27017/amdox_erp',
        dbName: configService.get<string>('MONGODB_DB_NAME') || 'amdox_erp',
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    TenantsModule,
    ProfilesModule,
    DashboardModule,
    FinanceModule,
    HrModule,
    SupplyChainModule,
    ProjectsModule,
    BiModule,
    NotificationsModule,
    HealthModule,
  ],
  providers: [
    Reflector,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: TenantScopeGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
