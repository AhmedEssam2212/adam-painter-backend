import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AvailabilityRepository } from '../repositories';
import { CreateAvailabilityDto, UpdateAvailabilityDto, AvailabilityResponseDto } from '../dto';
import { UserRole } from '../../../common/enums';
import { UserResponseDto } from '../../users/dto';
import { ValidationService } from '../../../common/services/validation.service';


@Injectable()
export class AvailabilityService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly validationService: ValidationService,
  ) {}

  async create(
    createAvailabilityDto: CreateAvailabilityDto,
    user: UserResponseDto,
  ): Promise<AvailabilityResponseDto> {
    // Validate user permissions
    this.validationService.validateUserPermission(
      user.role,
      [UserRole.PAINTER],
      'create availability slots'
    );

    // Validate time slot
    const startTime = new Date(createAvailabilityDto.startTime);
    const endTime = new Date(createAvailabilityDto.endTime);

    this.validationService.validateTimeSlot({ startTime, endTime });

    // Check for conflicts with existing availability
    const existingAvailability = await this.availabilityRepository.findByPainterId(user.id);
    const hasConflict = existingAvailability.some(existing => {
      const existingStart = new Date(existing.startTime);
      const existingEnd = new Date(existing.endTime);
      return (startTime < existingEnd && endTime > existingStart);
    });

    if (hasConflict) {
      throw new BadRequestException('Time slot conflicts with existing availability');
    }

    const availability = await this.availabilityRepository.create({
      ...createAvailabilityDto,
      painterId: user.id,
    });

    return new AvailabilityResponseDto(availability);
  }

  async findMyAvailability(user: UserResponseDto): Promise<AvailabilityResponseDto[]> {
    // Only painters can view their availability
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

    // Only the owner painter can update their availability
    if (availability.painterId !== user.id) {
      throw new ForbiddenException('You can only update your own availability slots');
    }

    // Validate time range if provided
    if (updateAvailabilityDto.startTime || updateAvailabilityDto.endTime) {
      const startTime = updateAvailabilityDto.startTime
        ? new Date(updateAvailabilityDto.startTime)
        : availability.startTime;
      const endTime = updateAvailabilityDto.endTime
        ? new Date(updateAvailabilityDto.endTime)
        : availability.endTime;

      if (startTime >= endTime) {
        throw new BadRequestException('Start time must be before end time');
      }

      if (startTime < new Date()) {
        throw new BadRequestException('Cannot set availability in the past');
      }

      // Check for conflicting availability slots
      const conflictingSlots = await this.availabilityRepository.findConflictingSlots(
        user.id,
        startTime,
        endTime,
        id, // Exclude current slot from conflict check
      );

      if (conflictingSlots.length > 0) {
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

    // If user is provided, check permissions (for regular users)
    if (user && availability.painterId !== user.id) {
      throw new ForbiddenException('You can only delete your own availability slots');
    }

    await this.availabilityRepository.delete(id);
  }

  // Flexible method for finding availability slots
  async findAll(filters?: {
    painterId?: string;
    startTime?: Date;
    endTime?: Date;
    isAvailable?: boolean;
  }): Promise<AvailabilityResponseDto[]> {
    let availability: any[];

    if (filters?.startTime && filters?.endTime) {
      // Find available slots within time range
      availability = await this.availabilityRepository.findAvailableSlots(
        filters.startTime,
        filters.endTime
      );
    } else if (filters?.painterId) {
      // Find by painter ID
      availability = await this.availabilityRepository.findAll({ painterId: filters.painterId });
    } else {
      // Find all availability slots
      availability = await this.availabilityRepository.findAll();
    }

    return availability.map((slot: any) => new AvailabilityResponseDto(slot));
  }

  // Convenience methods for backward compatibility
  async findByPainterId(painterId: string): Promise<AvailabilityResponseDto[]> {
    return this.findAll({ painterId });
  }

  async findAvailableSlots(startTime: Date, endTime: Date): Promise<AvailabilityResponseDto[]> {
    return this.findAll({ startTime, endTime });
  }
}
