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
import { AvailabilityService } from '../services';
import { CreateAvailabilityDto, UpdateAvailabilityDto, AvailabilityResponseDto } from '../dto';
import { JwtAuthGuard, RolesGuard } from '../../auth/guards';
import { CurrentUser, Roles } from '../../auth/decorators';
import { UserResponseDto } from '../../users/dto';
import { UserRole } from '../../../common/enums';

@Controller('availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @Roles(UserRole.PAINTER)
  @UseGuards(RolesGuard)
  async create(
    @Body() createAvailabilityDto: CreateAvailabilityDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<AvailabilityResponseDto> {
    return this.availabilityService.create(createAvailabilityDto, user);
  }

  @Get('me')
  @Roles(UserRole.PAINTER)
  @UseGuards(RolesGuard)
  async findMyAvailability(
    @CurrentUser() user: UserResponseDto,
  ): Promise<AvailabilityResponseDto[]> {
    return this.availabilityService.findMyAvailability(user);
  }

  @Get()
  async findAll(): Promise<AvailabilityResponseDto[]> {
    return this.availabilityService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AvailabilityResponseDto> {
    return this.availabilityService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.PAINTER)
  @UseGuards(RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<AvailabilityResponseDto> {
    return this.availabilityService.update(id, updateAvailabilityDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.PAINTER)
  @UseGuards(RolesGuard)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<void> {
    return this.availabilityService.delete(id, user);
  }
}
