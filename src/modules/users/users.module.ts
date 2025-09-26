import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/services';
import { CommonModule } from '../../common/common.module';
import { UserController } from './controllers';
import { UserService } from './services';
import { UserRepository } from './repositories';

@Module({
  imports: [CommonModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaService],
  exports: [UserService, UserRepository],
})
export class UsersModule {}
