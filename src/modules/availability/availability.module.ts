import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/services';
import { CommonModule } from '../../common/common.module';
import { AvailabilityController } from './controllers';
import { AvailabilityService } from './services';
import { AvailabilityRepository } from './repositories';

@Module({
  imports: [CommonModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService, AvailabilityRepository, PrismaService],
  exports: [AvailabilityService, AvailabilityRepository],
})
export class AvailabilityModule {}
