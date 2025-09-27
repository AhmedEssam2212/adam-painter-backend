import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../users/services';
import { UserRepository } from '../../users/repositories';
import { UserResponseDto } from '../../users/dto';
import { LoginDto, RegisterDto, AuthResponseDto } from '../dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userService.create(registerDto);

    const accessToken = this.generateToken(user);

    return new AuthResponseDto(user, accessToken);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userRepository.verifyPassword(user, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
