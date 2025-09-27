import { Availability } from '../../../common/types';
import { GenericRepositoryInterface } from '../../../common/interfaces';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from '../dto';

export interface AvailabilityRepositoryInterface extends GenericRepositoryInterface<Availability, CreateAvailabilityDto, UpdateAvailabilityDto> {
  findByPainterId(painterId: string): Promise<Availability[]>;
  findAvailableSlots(startTime: Date, endTime: Date): Promise<Availability[]>;
  findConflictingSlots(painterId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<Availability[]>;
  hasConflictingSlots(painterId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<boolean>;
}
