import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AvailabilityRepository } from '../repositories';
import { CreateAvailabilityDto, UpdateAvailabilityDto, AvailabilityResponseDto } from '../dto';
import { UserRole } from '../../../common/enums';
import { UserResponseDto } from '../../users/dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  async create(
    createAvailabilityDto: CreateAvailabilityDto,
    user: UserResponseDto,
  ): Promise<AvailabilityResponseDto> {
    // Only painters can create availability
    if (user.role !== UserRole.PAINTER) {
      throw new ForbiddenException('Only painters can create availability slots');
    }

    // Validate time range
    const startTime = new Date(createAvailabilityDto.startTime);
    const endTime = new Date(createAvailabilityDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Cannot create availability in the past');
    }

    // Check for conflicting availability slots
    const conflictingSlots = await this.availabilityRepository.findConflictingSlots(
      user.id,
      startTime,
      endTime,
    );

    if (conflictingSlots.length > 0) {
      throw new BadRequestException('This time slot conflicts with existing availability');
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
    return availabilities.map(availability => new AvailabilityResponseDto(availability));
  }

  async findAll(): Promise<AvailabilityResponseDto[]> {
    const availabilities = await this.availabilityRepository.findAll();
    return availabilities.map(availability => new AvailabilityResponseDto(availability));
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

  async delete(id: string, user: UserResponseDto): Promise<void> {
    const availability = await this.availabilityRepository.findById(id);
    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }

    // Only the owner painter can delete their availability
    if (availability.painterId !== user.id) {
      throw new ForbiddenException('You can only delete your own availability slots');
    }

    await this.availabilityRepository.delete(id);
  }

  async findAvailableSlots(startTime: Date, endTime: Date): Promise<AvailabilityResponseDto[]> {
    const availableSlots = await this.availabilityRepository.findAvailableSlots(startTime, endTime);
    return availableSlots.map(slot => new AvailabilityResponseDto(slot));
  }
}
