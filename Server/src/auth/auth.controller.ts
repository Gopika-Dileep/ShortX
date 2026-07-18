import { Controller, Post, Body, UsePipes, HttpCode, HttpStatus, Res, UseGuards, Req, Inject } from '@nestjs/common';
import type { Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { RegisterSchema } from './dto/register.dto';
import type { RegisterDto } from './dto/register.dto';
import { VerifyOtpSchema } from './dto/verify-otp.dto';
import type { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpSchema } from './dto/resend-otp.dto';
import type { ResendOtpDto } from './dto/resend-otp.dto';
import { LoginSchema } from './dto/login.dto';
import type { LoginDto } from './dto/login.dto';
import { ForgotPasswordSchema } from './dto/forgot-password.dto';
import type { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordSchema } from './dto/reset-password.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { CurrentUser } from './decorators/current-user.decorator';

import { IIdentityServiceToken } from './interfaces/identity.service.interface';
import type { IIdentityService } from './interfaces/identity.service.interface';
import { IAccountServiceToken } from './interfaces/account.service.interface';
import type { IAccountService } from './interfaces/account.service.interface';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(IIdentityServiceToken)
    private readonly identityService: IIdentityService,
    @Inject(IAccountServiceToken)
    private readonly accountService: IAccountService,
  ) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() registerDto: RegisterDto) {
    return this.identityService.register(registerDto);
  }

  @Post('verify-email')
  @UsePipes(new ZodValidationPipe(VerifyOtpSchema))
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.accountService.verifyEmail(verifyOtpDto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('resend-otp')
  @UsePipes(new ZodValidationPipe(ResendOtpSchema))
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.accountService.sendOtp(resendOtpDto.email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.identityService.login(loginDto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.user.refreshToken;
    const result = await this.identityService.refreshTokens(refreshToken);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = user._id.toString();
    await this.identityService.logout(userId);
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(ForgotPasswordSchema))
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.accountService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(ResetPasswordSchema))
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.accountService.resetPassword(resetPasswordDto);
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
