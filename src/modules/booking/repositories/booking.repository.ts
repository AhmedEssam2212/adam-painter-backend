import { Injectable } from '@nestjs/common';
import { Booking } from '@prisma/client';
import { PrismaService } from '../../../common/services';
import { BookingRepositoryInterface } from '../interfaces';
import { CreateBookingRequestDto, UpdateBookingDto } from '../dto';
import { BookingStatus } from '../../../common/enums';

@Injectable()
export class BookingRepository implements BookingRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBookingRequestDto & { customerId: string; painterId?: string; availabilityId?: string }): Promise<Booking> {
    return this.prisma.booking.create({
      data: {
        customerId: data.customerId,
        painterId: data.painterId,
        availabilityId: data.availabilityId,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: data.painterId ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
      },
      include: {
        customer: true,
        painter: true,
        availability: true,
      },
    });
  }

  async findById(id: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { id },
    });
  }

  async findWithDetails(id: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        painter: true,
        availability: true,
      },
    });
  }

  async findAll(filter?: any): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllWithDetails(): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      include: {
        customer: true,
        painter: true,
        availability: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateBookingDto): Promise<Booking> {
    const updateData: any = {};
    
    if (data.startTime) {
      updateData.startTime = new Date(data.startTime);
    }
    
    if (data.endTime) {
      updateData.endTime = new Date(data.endTime);
    }

    if (data.status) {
      updateData.status = data.status;
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        painter: true,
        availability: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.booking.delete({
      where: { id },
    });
  }

  async findOne(criteria: any): Promise<Booking | null> {
    return this.prisma.booking.findFirst({
      where: criteria,
    });
  }

  async findMany(criteria: any): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: criteria,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(criteria?: any): Promise<number> {
    return this.prisma.booking.count({
      where: criteria,
    });
  }

  async exists(criteria: any): Promise<boolean> {
    const count = await this.count(criteria);
    return count > 0;
  }

  async findByCustomerId(customerId: string): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: { customerId },
      include: {
        painter: true,
        availability: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPainterId(painterId: string): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: { painterId },
      include: {
        customer: true,
        availability: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findConflictingBookings(
    painterId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<Booking[]> {
    const where: any = {
      painterId,
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
      },
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

    return this.prisma.booking.findMany({
      where,
    });
  }
}
