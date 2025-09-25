import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../users/services';
import { UserResponseDto } from '../../users/dto';
import { LoginDto, RegisterDto, AuthResponseDto } from '../dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = await this.userService.create(registerDto);
    
    // Generate JWT token
    const accessToken = this.generateToken(user);

    return new AuthResponseDto(user, accessToken);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const userResponse = new UserResponseDto(user);
    const accessToken = this.generateToken(userResponse);

    return new AuthResponseDto(userResponse, accessToken);
  }

  async validateUser(userId: string): Promise<UserResponseDto | null> {
    try {
      return await this.userService.findById(userId);
    } catch {
      return null;
    }
  }

  private generateToken(user: UserResponseDto): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
