import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/services';
import { AvailabilityController } from './controllers';
import { AvailabilityService } from './services';
import { AvailabilityRepository } from './repositories';

@Module({
  controllers: [AvailabilityController],
  providers: [AvailabilityService, AvailabilityRepository, PrismaService],
  exports: [AvailabilityService, AvailabilityRepository],
})
export class AvailabilityModule {}
