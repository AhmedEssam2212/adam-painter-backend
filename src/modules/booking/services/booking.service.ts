import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { BookingRepository } from '../repositories';
import { AvailabilityRepository } from '../../availability/repositories';
import { CreateBookingRequestDto, UpdateBookingDto, BookingResponseDto } from '../dto';
import { UserRole, BookingStatus } from '../../../common/enums';
import { UserResponseDto } from '../../users/dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly availabilityRepository: AvailabilityRepository,
  ) {}

  async createBookingRequest(
    createBookingRequestDto: CreateBookingRequestDto,
    user: UserResponseDto,
  ): Promise<BookingResponseDto> {
    // Only customers can create booking requests
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Only customers can create booking requests');
    }

    // Validate time range
    const startTime = new Date(createBookingRequestDto.startTime);
    const endTime = new Date(createBookingRequestDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Cannot book in the past');
    }

    // Find available painters for the requested time slot
    const availableSlots = await this.availabilityRepository.findAvailableSlots(startTime, endTime);

    if (availableSlots.length === 0) {
      throw new BadRequestException('No painters are available for the requested time slot.');
    }

    // Select the first available painter (you could implement more sophisticated logic here)
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
    let bookings;

    if (user.role === UserRole.CUSTOMER) {
      bookings = await this.bookingRepository.findByCustomerId(user.id);
    } else if (user.role === UserRole.PAINTER) {
      bookings = await this.bookingRepository.findByPainterId(user.id);
    } else {
      throw new ForbiddenException('Invalid user role');
    }

    return bookings.map(booking => new BookingResponseDto(booking));
  }

  async findAll(): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepository.findAllWithDetails();
    return bookings.map(booking => new BookingResponseDto(booking));
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
    const canUpdate = 
      booking.customerId === user.id || 
      booking.painterId === user.id;

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
    const canCancel = 
      booking.customerId === user.id || 
      booking.painterId === user.id;

    if (!canCancel) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    const updatedBooking = await this.bookingRepository.update(id, {
      status: BookingStatus.CANCELLED,
    });

    return new BookingResponseDto(updatedBooking);
  }

  async delete(id: string, user: UserResponseDto): Promise<void> {
    const booking = await this.bookingRepository.findWithDetails(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Only customers can delete their own bookings
    if (booking.customerId !== user.id) {
      throw new ForbiddenException('You can only delete your own bookings');
    }

    await this.bookingRepository.delete(id);
  }
}
