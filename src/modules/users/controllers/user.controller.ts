import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services';
import { UserResponseDto, UpdateUserDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentUser } from '../../auth/decorators';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Profile endpoints
  @Get('me')
  async getProfile(@CurrentUser() user: UserResponseDto): Promise<UserResponseDto> {
    return this.userService.findById(user.id);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: UserResponseDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(user.id, updateUserDto);
  }

  // Public endpoints for browsing (authenticated users can view painters/customers)
  @Get('painters')
  async findPainters(): Promise<UserResponseDto[]> {
    return this.userService.findPainters();
  }

  @Get('customers')
  async findCustomers(): Promise<UserResponseDto[]> {
    return this.userService.findCustomers();
  }
}
