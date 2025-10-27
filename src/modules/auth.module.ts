import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '../controllers/auth.controller';
import { ProfileController } from '../controllers/profile.controller';
import { AuthService } from '../services/auth.service';
import { LocationsService } from '../services/locations.service';
import { User } from '../entities/user.entity';
import { Location } from '../entities/location.entity';
import { JwtStrategy } from '../guards/jwt.strategy';
import { jwtConfig } from '../config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Location]),
    PassportModule,
    JwtModule.register(jwtConfig),
  ],
  controllers: [AuthController, ProfileController],
  providers: [AuthService, LocationsService, JwtStrategy],
  exports: [AuthService, LocationsService],
})
export class AuthModule {}
