import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { UsersModule } from '../users/users.module';
import { AvailabilityModule } from '../availability/availability.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [UsersModule, AvailabilityModule, BookingModule],
  controllers: [AdminController],
})
export class AdminModule {}
