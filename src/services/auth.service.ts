import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Location } from '../entities/location.entity';
import { RegisterDto, LoginDto, AuthResponseDto } from '../dto/auth.dto';
import { jwtConfig, jwtRefreshConfig } from '../config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, username, password, locationId } = registerDto;

    // Verificar que la ubicación existe
    const location = await this.locationRepository.findOne({
      where: { id: locationId, isActive: true },
    });

    if (!location) {
      throw new NotFoundException('Location not found or inactive');
    }

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      locationId,
    });

    const savedUser = await this.userRepository.save(user);

    // Generar tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      ...tokens,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
        locationId: savedUser.locationId,
        location: {
          id: location.id,
          name: location.name,
        },
        avatar: savedUser.avatar,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuario con relación a location
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['location'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generar tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        locationId: user.locationId,
        location: user.location ? {
          id: user.location.id,
          name: user.location.name,
        } : undefined,
        avatar: user.avatar,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: jwtRefreshConfig.secret,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        jwtConfig,
      );

      return { access_token: accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.signOptions?.expiresIn,
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtRefreshConfig.secret,
      expiresIn: jwtRefreshConfig.expiresIn,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
