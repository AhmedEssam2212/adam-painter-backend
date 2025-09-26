import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard, AdminGuard } from '../../auth/guards';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserService } from '../../users/services';
import { AvailabilityService } from '../../availability/services';
import { BookingService } from '../../booking/services';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../users/dto';
import { BookingResponseDto } from '../../booking/dto';
import { AvailabilityResponseDto } from '../../availability/dto';
import { UserRole, BookingStatus } from '../../../common/enums';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly availabilityService: AvailabilityService,
    private readonly bookingService: BookingService,
  ) {}

  // User Management
  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Get('users')
  async getAllUsers(
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
    @Query('email') email?: string,
  ): Promise<UserResponseDto[]> {
    return this.userService.findAll({ role, search, email });
  }

  // Keep backward compatibility endpoints
  @Get('users/painters')
  async getAllPainters(): Promise<UserResponseDto[]> {
    return this.userService.findPainters();
  }

  @Get('users/customers')
  async getAllCustomers(): Promise<UserResponseDto[]> {
    return this.userService.findCustomers();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.delete(id);
  }

  // Booking Management
  @Get('bookings')
  async getAllBookings(
    @Query('status') status?: BookingStatus,
    @Query('customerId') customerId?: string,
    @Query('painterId') painterId?: string,
  ): Promise<BookingResponseDto[]> {
    return this.bookingService.findAll({ status, customerId, painterId });
  }

  // Keep backward compatibility endpoints
  @Get('bookings/pending')
  async getPendingBookings(): Promise<BookingResponseDto[]> {
    return this.bookingService.findByStatus(BookingStatus.PENDING);
  }

  @Get('bookings/confirmed')
  async getConfirmedBookings(): Promise<BookingResponseDto[]> {
    return this.bookingService.findByStatus(BookingStatus.CONFIRMED);
  }

  @Get('bookings/cancelled')
  async getCancelledBookings(): Promise<BookingResponseDto[]> {
    return this.bookingService.findByStatus(BookingStatus.CANCELLED);
  }

  @Patch('bookings/:id/status')
  async updateBookingStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @CurrentUser() user: UserResponseDto,
  ): Promise<BookingResponseDto> {
    return this.bookingService.updateStatus(id, status, user);
  }

  @Delete('bookings/:id')
  async deleteBooking(@Param('id') id: string): Promise<void> {
    return this.bookingService.delete(id);
  }

  // Availability Management
  @Get('availability')
  async getAllAvailability(
    @Query('painterId') painterId?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<AvailabilityResponseDto[]> {
    const filters: any = { painterId };

    if (startTime && endTime) {
      filters.startTime = new Date(startTime);
      filters.endTime = new Date(endTime);
    }

    return this.availabilityService.findAll(filters);
  }

  // Keep backward compatibility endpoint
  @Get('availability/painter/:painterId')
  async getPainterAvailability(
    @Param('painterId') painterId: string,
  ): Promise<AvailabilityResponseDto[]> {
    return this.availabilityService.findByPainterId(painterId);
  }

  @Delete('availability/:id')
  async deleteAvailability(@Param('id') id: string): Promise<void> {
    return this.availabilityService.delete(id);
  }
}
