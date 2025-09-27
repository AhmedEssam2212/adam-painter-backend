import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingStatus } from '../../../common/enums';
import {
  IsStartTimeBeforeEndTime,
  HasAdvanceNotice,
  HasMinimumDuration,
  HasMaximumDuration
} from '../../../common/decorators';

export class UpdateBookingDto {
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  @HasAdvanceNotice(24, { message: 'Booking updates must maintain at least 24 hours advance notice' })
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
