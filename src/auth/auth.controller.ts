import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { FirstName: string; LastName: string; UserName: string; email: string; password: string }) {
    console.log(`New user registered: ${body.UserName} (${body.email})`);
    return this.authService.register(body.FirstName, body.LastName, body.UserName, body.email, body.password);
    // log new user registration
  }

  @Post('login')
  async login(@Body() body: { identifier: string; password: string }) {
    const user = await this.authService.validateUser(body.identifier, body.password);
    console.log(`User logged in: ${user.UserName} (${user.email})`)
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    console.log(`Password reset requested for: ${body.email}`)
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    console.log(`Password reset for token: ${body.token}`)
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
