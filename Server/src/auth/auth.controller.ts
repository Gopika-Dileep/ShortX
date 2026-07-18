import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Req,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { RegisterDto, LoginDto } from './dto/auth.dto';
import { VerifyOtpDto, ResendOtpDto } from './dto/otp.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { IIdentityService } from './interfaces/services/identity.service.interface';
import { IAccountService } from './interfaces/services/account.service.interface';
import { AUTH_ROUTES } from './constants/routes';
import { AUTH_MESSAGES } from './constants/messages';
import { AUTH_COOKIES } from './constants/cookies';

@Controller(AUTH_ROUTES.BASE)
export class AuthController {
  constructor(
    @Inject(IIdentityService)
    private readonly identityService: IIdentityService,
    @Inject(IAccountService)
    private readonly accountService: IAccountService,
  ) {}

  @Post(AUTH_ROUTES.REGISTER)
  async register(@Body() registerDto: RegisterDto) {
    return this.identityService.register(registerDto);
  }

  @Post(AUTH_ROUTES.VERIFY_EMAIL)
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

  @Post(AUTH_ROUTES.RESEND_OTP)
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.accountService.sendOtp(resendOtpDto.email);
  }

  @Post(AUTH_ROUTES.LOGIN)
  @HttpCode(HttpStatus.OK)
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

  @Post(AUTH_ROUTES.REFRESH)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[AUTH_COOKIES.REFRESH_TOKEN] || req.body?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException(AUTH_MESSAGES.REFRESH_TOKEN_REQUIRED);
    }
    const result = await this.identityService.refreshTokens(refreshToken);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Post(AUTH_ROUTES.LOGOUT)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const userId = req.user._id.toString();
    await this.identityService.logout(userId);
    res.clearCookie(AUTH_COOKIES.REFRESH_TOKEN);
    return { message: AUTH_MESSAGES.LOGGED_OUT_SUCCESS };
  }

  @Post(AUTH_ROUTES.FORGOT_PASSWORD)
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.accountService.forgotPassword(forgotPasswordDto);
  }

  @Post(AUTH_ROUTES.RESET_PASSWORD)
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.accountService.resetPassword(resetPasswordDto);
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie(AUTH_COOKIES.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
