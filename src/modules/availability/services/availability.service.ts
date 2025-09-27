import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AvailabilityRepository } from '../repositories';
import { CreateAvailabilityDto, UpdateAvailabilityDto, AvailabilityResponseDto } from '../dto';
import { UserRole } from '../../../common/enums';
import { UserResponseDto } from '../../users/dto';
import { ValidationService } from '../../../common/services/validation.service';
import { BookingRepository } from '../../booking/repositories';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly validationService: ValidationService,
    private readonly bookingRepository: BookingRepository,
  ) {}

  async create(
    createAvailabilityDto: CreateAvailabilityDto,
    user: UserResponseDto,
  ): Promise<AvailabilityResponseDto> {
    this.validationService.validateUserPermission(
      user.role,
      [UserRole.PAINTER],
      'create availability slots',
    );

    const startTime = new Date(createAvailabilityDto.startTime);
    const endTime = new Date(createAvailabilityDto.endTime);

    const hasConflict = await this.availabilityRepository.hasConflictingSlots(
      user.id,
      startTime,
      endTime
    );

    if (hasConflict) {
      throw new BadRequestException('Time slot conflicts with existing availability');
    }

    const availability = await this.availabilityRepository.create({
      ...createAvailabilityDto,
      createdBy: user.id,
    });

    // Try to assign pending bookings to this new availability
    await this.assignPendingBookingsToAvailability(
      user.id,
      availability.id,
      startTime,
      endTime,
    );

    return new AvailabilityResponseDto(availability);
  }

  async findMyAvailability(user: UserResponseDto): Promise<AvailabilityResponseDto[]> {
    if (user.role !== UserRole.PAINTER) {
      throw new ForbiddenException('Only painters can view availability slots');
    }

    const availabilities = await this.availabilityRepository.findByPainterId(user.id);
    return availabilities.map((availability) => new AvailabilityResponseDto(availability));
  }

  async findById(id: string): Promise<AvailabilityResponseDto> {
    const availability = await this.availabilityRepository.findById(id);
    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }
    return new AvailabilityResponseDto(availability);
  }

  async update(
    id: string,
    updateAvailabilityDto: UpdateAvailabilityDto,
    user: UserResponseDto,
  ): Promise<AvailabilityResponseDto> {
    const availability = await this.availabilityRepository.findById(id);
    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }

    if (availability.createdBy !== user.id) {
      throw new ForbiddenException('You can only update your own availability slots');
    }

    if (updateAvailabilityDto.startTime || updateAvailabilityDto.endTime) {
      const startTime = updateAvailabilityDto.startTime
        ? new Date(updateAvailabilityDto.startTime)
        : availability.startTime;
      const endTime = updateAvailabilityDto.endTime
        ? new Date(updateAvailabilityDto.endTime)
        : availability.endTime;

      const hasConflict = await this.availabilityRepository.hasConflictingSlots(
        user.id,
        startTime,
        endTime,
        id, // Exclude current slot from conflict check
      );

      if (hasConflict) {
        throw new BadRequestException('This time slot conflicts with existing availability');
      }
    }

    const updatedAvailability = await this.availabilityRepository.update(id, updateAvailabilityDto);
    return new AvailabilityResponseDto(updatedAvailability);
  }

  async delete(id: string, user?: UserResponseDto): Promise<void> {
    const availability = await this.availabilityRepository.findById(id);
    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }

    if (user && availability.createdBy !== user.id) {
      throw new ForbiddenException('You can only delete your own availability slots');
    }

    await this.availabilityRepository.delete(id);
  }

  async findAll(filters?: {
    painterId?: string;
    startTime?: Date;
    endTime?: Date;
    isAvailable?: boolean;
  }): Promise<AvailabilityResponseDto[]> {
    let availability: any[];

    if (filters?.startTime && filters?.endTime) {
      availability = await this.availabilityRepository.findAvailableSlots(
        filters.startTime,
        filters.endTime,
      );
    } else if (filters?.painterId) {
      availability = await this.availabilityRepository.findAll({ painterId: filters.painterId });
    } else {
      availability = await this.availabilityRepository.findAll();
    }

    return availability.map((slot: any) => new AvailabilityResponseDto(slot));
  }

  async findByPainterId(painterId: string): Promise<AvailabilityResponseDto[]> {
    return this.findAll({ painterId });
  }

  async findAvailableSlots(startTime: Date, endTime: Date): Promise<AvailabilityResponseDto[]> {
    return this.findAll({ startTime, endTime });
  }

  private async assignPendingBookingsToAvailability(
    painterId: string,
    availabilityId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<void> {
    // Find pending bookings that overlap with the new availability
    const pendingBookings = await this.bookingRepository.findPendingBookingsInTimeRange(startTime, endTime);

    for (const booking of pendingBookings) {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      // Check if booking fits within the availability window
      if (bookingStart >= startTime && bookingEnd <= endTime) {
        // Check for conflicts with already assigned bookings for this painter
        const conflictingBookings = await this.bookingRepository.findConflictingBookings(
          painterId,
          bookingStart,
          bookingEnd,
        );

        if (conflictingBookings.length === 0) {
          // No conflicts, assign the booking
          await this.bookingRepository.assignPainterToBooking(
            booking.id,
            painterId,
            availabilityId,
          );
        }
      }
    }
  }
}
