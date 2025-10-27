import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../services/auth.service';
import { jwtConfig } from '../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret || 'fallback-secret',
    });
    console.log('JWT Strategy - Secret configured:', jwtConfig.secret ? 'Yes' : 'No');
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Payload received:', payload);
    const user = await this.authService.validateUser(payload.sub);
    console.log('JWT Strategy - User found:', user ? `ID: ${user.id}` : 'null');
    if (!user) {
      console.log('JWT Strategy - User validation failed');
      throw new UnauthorizedException();
    }
    return user;
  }
}
