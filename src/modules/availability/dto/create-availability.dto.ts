import { IsDateString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAvailabilityDto {
  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value).toISOString())
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value).toISOString())
  endTime: string;
}
