import { IsDateString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  IsStartTimeBeforeEndTime,
  IsNotInPast,
  HasMinimumDuration,
  HasMaximumDuration
} from '../../../common/decorators';

export class UpdateAvailabilityDto {
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsNotInPast({ message: 'Availability cannot be updated to a past time' })
  @IsStartTimeBeforeEndTime('endTime')
  @HasMinimumDuration('endTime', 30)
  @HasMaximumDuration('endTime', 8)
  startTime?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  endTime?: string;
}
