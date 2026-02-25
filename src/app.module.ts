import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MulterModule } from '@nestjs/platform-express';
import { envConfig } from '@config';
import { AuthModule } from '@modules/auth/auth.module';
import { CommonModule } from '@modules/common/common.module';
import { AuditModule } from '@modules/audit/audit.module';
import { ReportsModule } from '@modules/reports/reports.module';
import { ImportsModule } from '@modules/imports/imports.module';
import { CoreModule } from '@modules/core/core.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JoiValidationSchema } from './config/joi.validation';
import { ResponseHttpInterceptor } from '@utils/interceptors';
import { MigrationModule } from '@modules/migration/migration.module';
import { ExternalApiController } from '@modules/external-api/external-api.controller';
import { ExternalApiModule } from '@modules/external-api/external-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [envConfig],
      expandVariables: true,
      validationSchema: JoiValidationSchema,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60 * 1000,
          limit: 100,
        },
      ],
    }),
    MulterModule.register({ dest: './uploads' }),
    HttpModule,
    AuditModule,
    AuthModule,
    CommonModule,
    CoreModule,
    ReportsModule,
    ImportsModule,
    MigrationModule,
    ExternalApiModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseHttpInterceptor,
    },
    AppService,
  ],
})
export class AppModule {}
