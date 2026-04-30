import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        ssl: configService.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: configService.get<string>('TYPEORM_SYNCHRONIZE') === 'true',
        logging: configService.get<string>('TYPEORM_LOGGING') === 'true',
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
})
export class AppModule {}
