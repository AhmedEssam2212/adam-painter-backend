import { User } from '../../../common/types';
import { GenericRepositoryInterface } from '../../../common/interfaces';
import { CreateUserDto, UpdateUserDto } from '../dto';

export interface UserRepositoryInterface extends GenericRepositoryInterface<User, CreateUserDto, UpdateUserDto> {
  findByEmail(email: string): Promise<User | null>;
  findByRole(role: string): Promise<User[]>;
}
