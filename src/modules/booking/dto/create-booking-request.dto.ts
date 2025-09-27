import { IsDateString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  IsStartTimeBeforeEndTime,
  HasAdvanceNotice,
  HasMinimumDuration,
  HasMaximumDuration
} from '../../../common/decorators';

export class CreateBookingRequestDto {
  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value).toISOString())
  @HasAdvanceNotice(24, { message: 'Bookings must be made at least 24 hours in advance' })
  @IsStartTimeBeforeEndTime('endTime')
  @HasMinimumDuration('endTime', 30)
  @HasMaximumDuration('endTime', 8)
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value).toISOString())
  endTime: string;
}
