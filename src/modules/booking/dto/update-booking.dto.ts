import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingStatus } from '../../../common/enums';
import {
  IsStartTimeBeforeEndTime,
  HasMinimumDuration,
  HasMaximumDuration
} from '../../../common/decorators';

export class UpdateBookingDto {
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsStartTimeBeforeEndTime('endTime')
  @HasMinimumDuration('endTime', 30)
  @HasMaximumDuration('endTime', 8)
  startTime?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  endTime?: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;
}
