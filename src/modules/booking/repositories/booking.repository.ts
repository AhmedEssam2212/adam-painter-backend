import { Injectable } from '@nestjs/common';
import { Booking, BookingStatus } from '@prisma/client';
import { PrismaService } from '../../../common/services';
import { BookingRepositoryInterface } from '../interfaces';
import { CreateBookingRequestDto, UpdateBookingDto } from '../dto';

@Injectable()
export class BookingRepository implements BookingRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBookingRequestDto & { createdBy: string; painterId?: string; availabilityId?: string }): Promise<Booking> {
    return this.prisma.booking.create({
      data: {
        createdBy: data.createdBy,
        painterId: data.painterId,
        availabilityId: data.availabilityId,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: data.painterId ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
      },
      include: {
        creator: true,
        painter: true,
        availability: {
          include: {
            creator: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        painter: true,
        availability: true,
      },
    });
  }

  async findWithDetails(id: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
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
      where: {
        createdBy: customerId
      },
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

  async findPendingBookingsInTimeRange(
    startTime: Date,
    endTime: Date,
  ): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        painterId: null, // Unassigned bookings
        OR: [
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gt: startTime } },
            ],
          },
        ],
      },
      include: {
        painter: true,
      },
      orderBy: { createdAt: 'asc' }, // First come, first served
    });
  }

  async assignPainterToBooking(
    bookingId: string,
    painterId: string,
    availabilityId: string,
  ): Promise<Booking> {
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        painterId,
        availabilityId,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        painter: true,
        availability: true,
      },
    });
  }
}
