import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { IIdentityService } from '../interfaces/services/identity.service.interface';
import { IAuthRepository } from '../interfaces/repository/auth.repository.interface';
import { IRedisService } from '../../database/redis/interfaces/redis.service.interface';
import { IMailService } from '../../mail/interfaces/mail.service.interface';
import type { RegisterDto, LoginDto } from '../dto/auth.dto';
import { AuthMapper } from '../mapper/auth.mapper';
import { User } from '../schemas/user.schema';

@Injectable()
export class IdentityService implements IIdentityService {
  constructor(
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(IRedisService)
    private readonly redisService: IRedisService,
    @Inject(IMailService)
    private readonly mailService: IMailService,
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
      await this.authRepository.update(
        existingUser._id.toString(),
        existingUser,
      );
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
    const otpExpiry = this.configService.get<number>('OTP_EXPIRY_SECONDS')!;
    await this.redisService.set(`otp:${email}`, otp, otpExpiry);

    await this.mailService.sendMail(
      registerDto.email,
      'Email Verification - ShortX',
      `<h3>Welcome to ShortX!</h3>
       <p>Please verify your email using the following One-Time Password (OTP):</p>
       <h2>${otp}</h2>
       <p>This code will expire in ${Math.floor(otpExpiry / 60)} minutes.</p>`,
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
      throw new UnauthorizedException(
        'Email not verified. Please verify your email first.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
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
      const secret = this.configService.get<string>('JWT_SECRET');
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
