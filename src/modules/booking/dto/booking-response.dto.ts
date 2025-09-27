import { BookingStatus } from '../../../common/enums';

export class PainterInfoDto {
  id: string;
  name: string;

  constructor(painter: any) {
    this.id = painter.id;
    this.name = painter.name;
  }
}

export class CustomerInfoDto {
  id: string;
  name: string;
  role: string;

  constructor(customer: any) {
    this.id = customer.id;
    this.name = customer.name;
    this.role = customer.role;
  }
}

export class BookingResponseDto {
  bookingId: string;
  createdBy: string;
  customer?: CustomerInfoDto;
  painter?: PainterInfoDto;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(booking: any) {
    this.bookingId = booking.id;
    this.createdBy = booking.createdBy;
    this.customer = booking.creator ? new CustomerInfoDto(booking.creator) : undefined;
    this.painter = booking.painter ? new PainterInfoDto(booking.painter) : undefined;
    this.startTime = booking.startTime.toISOString();
    this.endTime = booking.endTime.toISOString();
    this.status = booking.status;
    this.createdAt = booking.createdAt;
    this.updatedAt = booking.updatedAt;
  }
}
