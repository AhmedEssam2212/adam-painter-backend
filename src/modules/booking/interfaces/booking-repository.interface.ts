import { Booking } from '@prisma/client';
import { GenericRepositoryInterface } from '../../../common/interfaces';
import { CreateBookingRequestDto, UpdateBookingDto } from '../dto';

export interface BookingRepositoryInterface extends GenericRepositoryInterface<Booking, CreateBookingRequestDto, UpdateBookingDto> {
  findByCustomerId(customerId: string): Promise<Booking[]>;
  findByPainterId(painterId: string): Promise<Booking[]>;
  findConflictingBookings(painterId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<Booking[]>;
  findWithDetails(id: string): Promise<Booking | null>;
  findAllWithDetails(): Promise<Booking[]>;
}
