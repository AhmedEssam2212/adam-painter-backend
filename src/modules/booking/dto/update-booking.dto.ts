import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingStatus } from '../../../common/enums';

export class UpdateBookingDto {
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  startTime?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  endTime?: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;
}
