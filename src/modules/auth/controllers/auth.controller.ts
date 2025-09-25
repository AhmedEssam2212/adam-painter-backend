import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from '../services';
import { LoginDto, RegisterDto, AuthResponseDto } from '../dto';
import { JwtAuthGuard } from '../guards';
import { CurrentUser } from '../decorators';
import { UserResponseDto } from '../../users/dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: UserResponseDto): Promise<UserResponseDto> {
    return user;
  }
}
