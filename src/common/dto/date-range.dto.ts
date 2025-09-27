import { IsDateString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsValidDateRange } from '../decorators';

export class DateRangeDto {
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsValidDateRange('endDate', 30)
  startDate: string;

  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  endDate: string;
}

export class OptionalDateRangeDto {
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsValidDateRange('endDate', 30)
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  endDate?: string;
}
