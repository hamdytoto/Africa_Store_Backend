import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/sendOtp.dto';
import { VerifyUserDto } from './dto/verifyUser.dto';
import { ResendOtpDto } from './dto/resendOtp.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { Public } from 'src/common/decorators/auth/public.decorator';
import { CurrentToken } from 'src/common/decorators/auth/currentToken.decorator';
import type { tokenDocument } from 'src/db/models/token.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Public()
  @Post("register")
  register(@Body() data: CreateUserDto) {
    return this.authService.register(data);
  }
  @Public()
  @Post("login")
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post("logout")
  logout(@CurrentToken() token: tokenDocument) {
    return this.authService.logout(token);
  }

  @Public()
  @Post("send_otp")
  sendOtp(@Body() data: SendOtpDto) {
    return this.authService.sendOtp(data);
  }
  @Public()
  @Post("verify_user")
  verifyUser(@Body() data: VerifyUserDto) {
    return this.authService.verifyUser(data);
  }
  @Public()
  @Post("verify_user/resend")
  resendOtp(@Body() data: ResendOtpDto) {
    return this.authService.resendOtp(data);
  }
  @Public()
  @Post("password/forgot_password")
  forgetPassword(@Body() data: SendOtpDto) {
    return this.authService.forgetPassword(data);
  }

  @Public()
  @Post("password/reset_password")
  resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  @Public()
  @Post("password/validate_code")
  validateCode(@Body() data: VerifyUserDto) {
    return this.authService.validateCode(data);
  }








}
