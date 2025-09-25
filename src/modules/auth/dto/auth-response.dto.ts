import { UserResponseDto } from '../../users/dto';

export class AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;

  constructor(user: UserResponseDto, accessToken: string) {
    this.user = user;
    this.accessToken = accessToken;
  }
}
