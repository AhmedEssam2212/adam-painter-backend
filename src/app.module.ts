import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// Configuration
import { appConfig, databaseConfig, jwtConfig } from './config';

// Common services
import { PrismaService } from './common/services';

// Global filters and interceptors
import { GlobalExceptionFilter } from './common/filters';
import { SuccessResponseInterceptor } from './common/interceptors';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { BookingModule } from './modules/booking/booking.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    AvailabilityModule,
    BookingModule,
  ],
  providers: [
    // Global services
    PrismaService,

    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },

    // Global success response interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessResponseInterceptor,
    },
  ],
})
export class AppModule {}
