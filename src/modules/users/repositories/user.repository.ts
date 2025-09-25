import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../common/services';
import { User } from '../../../common/types';
import { UserRepositoryInterface } from '../interfaces';
import { CreateUserDto, UpdateUserDto } from '../dto';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findAll(filter?: any): Promise<User[]> {
    return this.prisma.user.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const updateData = { ...data };
    
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findOne(criteria: any): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: criteria,
    });
  }

  async findMany(criteria: any): Promise<User[]> {
    return this.prisma.user.findMany({
      where: criteria,
    });
  }

  async count(criteria?: any): Promise<number> {
    return this.prisma.user.count({
      where: criteria,
    });
  }

  async exists(criteria: any): Promise<boolean> {
    const count = await this.count(criteria);
    return count > 0;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByRole(role: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { role: role as any },
      orderBy: { createdAt: 'desc' },
    });
  }
}
