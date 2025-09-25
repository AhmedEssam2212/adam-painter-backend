import { BookingStatus } from '../../../common/enums';

export class PainterInfoDto {
  id: string;
  name: string;

  constructor(painter: any) {
    this.id = painter.id;
    this.name = painter.name;
  }
}

export class BookingResponseDto {
  bookingId: string;
  painter?: PainterInfoDto;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(booking: any) {
    this.bookingId = booking.id;
    this.painter = booking.painter ? new PainterInfoDto(booking.painter) : undefined;
    this.startTime = booking.startTime.toISOString();
    this.endTime = booking.endTime.toISOString();
    this.status = booking.status;
    this.createdAt = booking.createdAt;
    this.updatedAt = booking.updatedAt;
  }
}
