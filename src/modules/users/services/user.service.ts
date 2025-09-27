import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { UserRepository } from '../repositories';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto';
import { UserRole } from '../../../common/enums';


@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userRepository.create(createUserDto);
    return new UserResponseDto(user);
  }

  async findAll(filters?: {
    role?: UserRole;
    email?: string;
    search?: string;
  }): Promise<UserResponseDto[]> {
    let users: any[];

    if (filters?.role) {
      users = await this.userRepository.findByRole(filters.role);
    } else if (filters?.email) {
      const user = await this.userRepository.findByEmail(filters.email);
      users = user ? [user] : [];
    } else if (filters?.search) {
      users = await this.userRepository.searchUsers(filters.search);
    } else {
      users = await this.userRepository.findAll();
    }

    return users.map(user => new UserResponseDto(user));
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<any | null> {
    return this.userRepository.findByEmail(email);
  }

  async findPainters(): Promise<UserResponseDto[]> {
    return this.findAll({ role: UserRole.PAINTER });
  }

  async findCustomers(): Promise<UserResponseDto[]> {
    return this.findAll({ role: UserRole.CUSTOMER });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if email is being updated
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(updateUserDto.email);
      if (userWithEmail) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const user = await this.userRepository.update(id, updateUserDto);
    return new UserResponseDto(user);
  }

  async delete(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(id);
  }

  async countByRole(role: UserRole): Promise<number> {
    return this.userRepository.count({ role });
  }

  // Additional methods required by IUserService interface
  async count(filters?: any): Promise<number> {
    return this.userRepository.count(filters);
  }

  async exists(criteria: any): Promise<boolean> {
    if (criteria.email) {
      const user = await this.userRepository.findByEmail(criteria.email);
      return !!user;
    }
    if (criteria.id) {
      const user = await this.userRepository.findById(criteria.id);
      return !!user;
    }
    return false;
  }
}
