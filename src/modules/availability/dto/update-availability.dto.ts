import { IsDateString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAvailabilityDto {
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  startTime?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  endTime?: string;
}
