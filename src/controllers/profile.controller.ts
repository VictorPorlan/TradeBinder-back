import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  @Get()
  getProfile(@Request() req) {
    return {
      message: 'Profile accessed successfully',
      user: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        location: req.user.location,
        avatar: req.user.avatar,
      },
    };
  }
}
