import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocationsService } from '../services/locations.service';
import { RegisterDto, LoginDto, AuthResponseDto } from '../dto/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { Location } from '../entities/location.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly locationsService: LocationsService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refresh_token') refreshToken: string): Promise<{ access_token: string }> {
    return this.authService.refreshToken(refreshToken);
  }

  @Get('locations')
  async getLocations(): Promise<Location[]> {
    return this.locationsService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@GetUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      locationId: user.locationId,
      location: user.location,
    };
  }
}
