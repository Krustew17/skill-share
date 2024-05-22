import { registerUserDto } from '../dto/register.dto';
import { loginPayloadDto } from '../dto/login.dto';
import { AuthService } from '../services/auth.service';

import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() userData: registerUserDto) {
    console.log(userData);
    return this.authService.createUser(userData);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyUser(token);
  }
  @Post('login')
  loginUser(
    @Body() AuthPayload: loginPayloadDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.loginUser(AuthPayload, req, res);
  }

  @Delete('delete')
  deleteUser(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.deleteUser(req, res);
  }

  @Post('request-password-reset')
  async sendPasswordResetEmail(@Body('email') email: string) {
    return this.authService.sendPasswordResetEmail(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body('password') newPassword: string,
    @Body('confirmPassword') confirmPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword, confirmPassword);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request, @Res() res: Response) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const loginResult = await this.authService.googleLogin(req);
    console.log(loginResult);
    if (loginResult) {
      res.redirect('http://127.0.0.1:5173?token=' + loginResult.access_token);
    }
  }
}
