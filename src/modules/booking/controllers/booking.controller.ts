import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from '../services';
import { CreateBookingRequestDto, UpdateBookingDto, BookingResponseDto } from '../dto';
import { JwtAuthGuard, RolesGuard } from '../../auth/guards';
import { CurrentUser, Roles } from '../../auth/decorators';
import { UserResponseDto } from '../../users/dto';
import { UserRole } from '../../../common/enums';

@Controller()
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('booking-request')
  @Roles(UserRole.CUSTOMER)
  @UseGuards(RolesGuard)
  async createBookingRequest(
    @Body() createBookingRequestDto: CreateBookingRequestDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<BookingResponseDto> {
    return this.bookingService.createBookingRequest(createBookingRequestDto, user);
  }

  @Get('bookings/me')
  async findMyBookings(
    @CurrentUser() user: UserResponseDto,
  ): Promise<BookingResponseDto[]> {
    return this.bookingService.findMyBookings(user);
  }

  @Get('bookings')
  async findAll(): Promise<BookingResponseDto[]> {
    return this.bookingService.findAll();
  }

  @Get('bookings/:id')
  async findOne(@Param('id') id: string): Promise<BookingResponseDto> {
    return this.bookingService.findById(id);
  }

  @Patch('bookings/:id')
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<BookingResponseDto> {
    return this.bookingService.update(id, updateBookingDto, user);
  }

  @Patch('bookings/:id/cancel')
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<BookingResponseDto> {
    return this.bookingService.cancel(id, user);
  }

  @Delete('bookings/:id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<void> {
    return this.bookingService.delete(id, user);
  }
}
