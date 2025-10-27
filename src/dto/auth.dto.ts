import { IsEmail, IsString, MinLength, IsOptional, IsNumber } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsNumber()
  locationId: number;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class AuthResponseDto {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    username: string;
    locationId: number;
    location?: {
      id: number;
      name: string;
    };
    avatar?: string;
  };
}
