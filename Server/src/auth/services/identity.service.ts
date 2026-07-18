import { Injectable, Inject, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { IIdentityService } from '../interfaces/identity.service.interface';
import { IAuthRepositoryToken } from '../interfaces/auth.repository.interface';
import type { IAuthRepository } from '../interfaces/auth.repository.interface';
import { RedisService } from '../../database/redis/redis.service';
import { MailService } from '../../mail/mail.service';
import type { RegisterDto } from '../dto/register.dto';
import type { LoginDto } from '../dto/login.dto';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { AuthMapper } from '../mapper/auth.mapper';
import { User } from '../schemas/user.schema';

@Injectable()
export class IdentityService implements IIdentityService {
  constructor(
    @Inject(IAuthRepositoryToken)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase();
    const existingUser = await this.authRepository.findByEmail(email);

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new ConflictException('Email already registered');
      }
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      existingUser.password = hashedPassword;
      if (registerDto.name) {
        existingUser.name = registerDto.name;
      }
      await this.authRepository.update(existingUser._id.toString(), existingUser);
    } else {
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      await this.authRepository.create({
        email,
        password: hashedPassword,
        name: registerDto.name,
        isVerified: false,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redisService.set(`otp:${email}`, otp, AUTH_CONSTANTS.OTP_EXPIRY_SECONDS);

    await this.mailService.sendMail(
      registerDto.email,
      'Email Verification - ShortX',
      `<h3>Welcome to ShortX!</h3>
       <p>Please verify your email using the following One-Time Password (OTP):</p>
       <h2>${otp}</h2>
       <p>This code will expire in 5 minutes.</p>`,
    );

    return { message: 'Verification OTP sent to your email' };
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.toLowerCase();
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified. Please verify your email first.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.authRepository.update(user._id.toString(), user);

    return {
      user: AuthMapper.toResponse(user),
      ...tokens,
    };
  }

  async logout(userId: string) {
    const user = await this.authRepository.findById(userId);
    if (user) {
      user.refreshToken = null;
      await this.authRepository.update(userId, user);
    }
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const secret = this.configService.get<string>('jwt.secret') ?? 'super_secret_jwt_key';
      const payload = this.jwtService.verify(refreshToken, { secret });

      const user = await this.authRepository.findById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newTokens = await this.generateTokens(user);
      user.refreshToken = await bcrypt.hash(newTokens.refreshToken, 10);
      await this.authRepository.update(user._id.toString(), user);

      return newTokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User) {
    const payload = { sub: user._id.toString(), email: user.email };
    const secret = this.configService.get<string>('jwt.secret') ?? 'super_secret_jwt_key';

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: (this.configService.get<string>('jwt.expiration') ?? '24h') as any,
    });

    return { accessToken, refreshToken };
  }
}
