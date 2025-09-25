import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/services';
import { Availability } from '../../../common/types';
import { AvailabilityRepositoryInterface } from '../interfaces';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from '../dto';

@Injectable()
export class AvailabilityRepository implements AvailabilityRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAvailabilityDto & { painterId: string }): Promise<Availability> {
    return this.prisma.availability.create({
      data: {
        painterId: data.painterId,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
      },
    });
  }

  async findById(id: string): Promise<Availability | null> {
    return this.prisma.availability.findUnique({
      where: { id },
    });
  }

  async findAll(filter?: any): Promise<Availability[]> {
    return this.prisma.availability.findMany({
      where: filter,
      orderBy: { startTime: 'asc' },
    });
  }

  async update(id: string, data: UpdateAvailabilityDto): Promise<Availability> {
    const updateData: any = {};
    
    if (data.startTime) {
      updateData.startTime = new Date(data.startTime);
    }
    
    if (data.endTime) {
      updateData.endTime = new Date(data.endTime);
    }

    return this.prisma.availability.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.availability.delete({
      where: { id },
    });
  }

  async findOne(criteria: any): Promise<Availability | null> {
    return this.prisma.availability.findFirst({
      where: criteria,
    });
  }

  async findMany(criteria: any): Promise<Availability[]> {
    return this.prisma.availability.findMany({
      where: criteria,
      orderBy: { startTime: 'asc' },
    });
  }

  async count(criteria?: any): Promise<number> {
    return this.prisma.availability.count({
      where: criteria,
    });
  }

  async exists(criteria: any): Promise<boolean> {
    const count = await this.count(criteria);
    return count > 0;
  }

  async findByPainterId(painterId: string): Promise<Availability[]> {
    return this.prisma.availability.findMany({
      where: { painterId },
      orderBy: { startTime: 'asc' },
    });
  }

  async findAvailableSlots(startTime: Date, endTime: Date): Promise<Availability[]> {
    return this.prisma.availability.findMany({
      where: {
        AND: [
          { startTime: { lte: startTime } },
          { endTime: { gte: endTime } },
        ],
      },
      include: {
        painter: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findConflictingSlots(
    painterId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<Availability[]> {
    const where: any = {
      painterId,
      OR: [
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
      ],
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    return this.prisma.availability.findMany({
      where,
    });
  }
}
