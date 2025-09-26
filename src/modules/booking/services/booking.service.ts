import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { BookingRepository } from '../repositories';
import { AvailabilityRepository } from '../../availability/repositories';
import { CreateBookingRequestDto, UpdateBookingDto, BookingResponseDto } from '../dto';
import { UserRole, BookingStatus } from '../../../common/enums';
import { UserResponseDto } from '../../users/dto';

import { ValidationService } from '../../../common/services/validation.service';

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly validationService: ValidationService,
  ) {}

  async createBookingRequest(
    createBookingRequestDto: CreateBookingRequestDto,
    user: UserResponseDto,
  ): Promise<BookingResponseDto> {
    // Validate user permissions
    this.validationService.validateUserPermission(
      user.role,
      [UserRole.CUSTOMER],
      'create booking requests'
    );

    // Validate time slot
    const startTime = new Date(createBookingRequestDto.startTime);
    const endTime = new Date(createBookingRequestDto.endTime);

    this.validationService.validateTimeSlot({ startTime, endTime });
    this.validationService.validateAdvanceNotice(startTime, 24);

    // Find available painters for the requested time slot
    const availableSlots = await this.availabilityRepository.findAvailableSlots(startTime, endTime);

    if (availableSlots.length === 0) {
      throw new BadRequestException('No painters are available for the requested time slot.');
    }

    // Simply select the first available painter (automatic assignment)
    const selectedSlot = availableSlots[0];
    const painterId = selectedSlot.painterId;

    // Check for conflicting bookings for the selected painter
    const conflictingBookings = await this.bookingRepository.findConflictingBookings(
      painterId,
      startTime,
      endTime,
    );

    if (conflictingBookings.length > 0) {
      throw new BadRequestException('Selected painter has conflicting bookings');
    }

    // Create the booking
    const booking = await this.bookingRepository.create({
      ...createBookingRequestDto,
      customerId: user.id,
      painterId,
      availabilityId: selectedSlot.id,
    });

    return new BookingResponseDto(booking);
  }

  async findMyBookings(user: UserResponseDto): Promise<BookingResponseDto[]> {
    if (user.role === UserRole.CUSTOMER) {
      return this.findAll({ customerId: user.id });
    } else if (user.role === UserRole.PAINTER) {
      return this.findAll({ painterId: user.id });
    } else {
      throw new ForbiddenException('Invalid user role');
    }
  }

  async findAll(filters?: {
    status?: BookingStatus;
    customerId?: string;
    painterId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<BookingResponseDto[]> {
    let bookings: any[];

    if (filters?.customerId) {
      bookings = await this.bookingRepository.findByCustomerId(filters.customerId);
    } else if (filters?.painterId) {
      bookings = await this.bookingRepository.findByPainterId(filters.painterId);
    } else if (filters?.status) {
      bookings = await this.bookingRepository.findAll({ status: filters.status });
    } else {
      bookings = await this.bookingRepository.findAllWithDetails();
    }

    return bookings.map((booking: any) => new BookingResponseDto(booking));
  }

  async findById(id: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findWithDetails(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return new BookingResponseDto(booking);
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
    user: UserResponseDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findWithDetails(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check permissions
    const canUpdate = booking.customerId === user.id || booking.painterId === user.id;

    if (!canUpdate) {
      throw new ForbiddenException('You can only update your own bookings');
    }

    // Validate time changes if provided
    if (updateBookingDto.startTime || updateBookingDto.endTime) {
      const startTime = updateBookingDto.startTime
        ? new Date(updateBookingDto.startTime)
        : booking.startTime;
      const endTime = updateBookingDto.endTime
        ? new Date(updateBookingDto.endTime)
        : booking.endTime;

      if (startTime >= endTime) {
        throw new BadRequestException('Start time must be before end time');
      }

      if (startTime < new Date()) {
        throw new BadRequestException('Cannot reschedule to the past');
      }

      // Check for conflicts if painter is assigned
      if (booking.painterId) {
        const conflictingBookings = await this.bookingRepository.findConflictingBookings(
          booking.painterId,
          startTime,
          endTime,
          id, // Exclude current booking
        );

        if (conflictingBookings.length > 0) {
          throw new BadRequestException('Time slot conflicts with existing bookings');
        }
      }
    }

    const updatedBooking = await this.bookingRepository.update(id, updateBookingDto);
    return new BookingResponseDto(updatedBooking);
  }

  async cancel(id: string, user: UserResponseDto): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findWithDetails(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check permissions
    const canCancel = booking.customerId === user.id || booking.painterId === user.id;

    if (!canCancel) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    const updatedBooking = await this.bookingRepository.update(id, {
      status: BookingStatus.CANCELLED,
    });

    return new BookingResponseDto(updatedBooking);
  }

  async delete(id: string, user?: UserResponseDto): Promise<void> {
    const booking = await this.bookingRepository.findWithDetails(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // If user is provided, check permissions (for regular users)
    if (user && booking.customerId !== user.id) {
      throw new ForbiddenException('You can only delete your own bookings');
    }

    await this.bookingRepository.delete(id);
  }

  // Convenience method for backward compatibility
  async findByStatus(status: BookingStatus): Promise<BookingResponseDto[]> {
    return this.findAll({ status });
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
    user: UserResponseDto
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findWithDetails(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Basic role-based validation
    if (user.role === UserRole.PAINTER && booking.painterId !== user.id) {
      throw new ForbiddenException('Painters can only update their own bookings');
    }

    if (user.role === UserRole.CUSTOMER && booking.customerId !== user.id) {
      throw new ForbiddenException('Customers can only update their own bookings');
    }

    const updatedBooking = await this.bookingRepository.update(id, { status });
    return new BookingResponseDto(updatedBooking);
  }



  async count(): Promise<number> {
    const bookings = await this.bookingRepository.findAll();
    return bookings.length;
  }

  async countByStatus(status: BookingStatus): Promise<number> {
    const bookings = await this.bookingRepository.findAll({ status });
    return bookings.length;
  }
}
