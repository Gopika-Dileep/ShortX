import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { IAccountService } from '../interfaces/services/account.service.interface';
import { IAuthRepository } from '../interfaces/repository/auth.repository.interface';
import { IRedisService } from '../../database/redis/interfaces/redis.service.interface';
import { IMailService } from '../../mail/interfaces/mail.service.interface';
import type { VerifyOtpDto } from '../dto/otp.dto';
import type { ForgotPasswordDto, ResetPasswordDto } from '../dto/password.dto';
import { AuthMapper } from '../mapper/auth.mapper';
import { User } from '../schemas/user.schema';

@Injectable()
export class AccountService implements IAccountService {
  constructor(
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    @Inject(IRedisService)
    private readonly redisService: IRedisService,
    @Inject(IMailService)
    private readonly mailService: IMailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async sendOtp(email: string) {
    const emailLower = email.toLowerCase();
    const user = await this.authRepository.findByEmail(emailLower);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = this.configService.get<number>('OTP_EXPIRY_SECONDS')!;
    await this.redisService.set(`otp:${emailLower}`, otp, otpExpiry);

    await this.mailService.sendMail(
      emailLower,
      'Email Verification - ShortX',
      `<h3>Email Verification</h3>
       <p>Your verification OTP is:</p>
       <h2>${otp}</h2>
       <p>This code will expire in ${Math.floor(otpExpiry / 60)} minutes.</p>`,
    );

    return { message: 'Verification OTP sent to your email' };
  }

  async verifyEmail(verifyOtpDto: VerifyOtpDto) {
    const email = verifyOtpDto.email.toLowerCase();
    const storedOtp = await this.redisService.get(`otp:${email}`);

    if (!storedOtp || storedOtp !== verifyOtpDto.otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isVerified = true;
    const tokens = await this.generateTokens(user);
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.authRepository.update(user._id.toString(), user);

    await this.redisService.delete(`otp:${email}`);

    return {
      user: AuthMapper.toResponse(user),
      ...tokens,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = forgotPasswordDto.email.toLowerCase();
    const user = await this.authRepository.findByEmail(email);

    if (user && user.isVerified) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = this.configService.get<number>(
        'RESET_TOKEN_EXPIRY_SECONDS',
      )!;
      await this.redisService.set(
        `reset:${resetToken}`,
        email,
        resetTokenExpiry,
      );

      const clientUrl = this.configService.get<string>('CLIENT_URL');
      const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

      await this.mailService.sendMail(
        email,
        'Password Reset Link - ShortX',
        `<h3>Password Reset Request</h3>
         <p>You requested a password reset. Click the link below to set a new password:</p>
         <a href="${resetLink}" target="_blank">Reset Password</a>
         <p>This link will expire in ${Math.floor(resetTokenExpiry / 60)} minutes. If you did not make this request, please ignore this email.</p>`,
      );
    }

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const email = await this.redisService.get(
      `reset:${resetPasswordDto.token}`,
    );
    if (!email) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
    user.password = hashedPassword;
    user.refreshToken = null;
    await this.authRepository.update(user._id.toString(), user);

    await this.redisService.delete(`reset:${resetPasswordDto.token}`);

    return { message: 'Password has been reset successfully' };
  }

  private async generateTokens(user: User) {
    const payload = { sub: user._id.toString(), email: user.email };
    const secret = this.configService.get<string>('JWT_SECRET');

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: (this.configService.get<string>('JWT_EXPIRATION') ?? '24h') as any,
    });

    return { accessToken, refreshToken };
  }
}
