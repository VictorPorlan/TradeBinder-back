import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h', // Increased for debugging
  },
};

export const jwtRefreshConfig = {
  secret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
