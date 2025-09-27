import { IsDateString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  IsStartTimeBeforeEndTime,
  IsNotInPast,
  HasMinimumDuration,
  HasMaximumDuration
} from '../../../common/decorators';

export class CreateAvailabilityDto {
  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsNotInPast({ message: 'Availability cannot be created in the past' })
  @IsStartTimeBeforeEndTime('endTime')
  @HasMinimumDuration('endTime', 30)
  @HasMaximumDuration('endTime', 8)
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value).toISOString())
  endTime: string;
}
