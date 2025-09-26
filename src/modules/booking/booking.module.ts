import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/services';
import { CommonModule } from '../../common/common.module';
import { AvailabilityModule } from '../availability/availability.module';
import { BookingController } from './controllers';
import { BookingService } from './services';
import { BookingRepository } from './repositories';

@Module({
  imports: [CommonModule, AvailabilityModule],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository, PrismaService],
  exports: [BookingService, BookingRepository],
})
export class BookingModule {}
