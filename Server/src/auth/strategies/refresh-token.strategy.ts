import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { IAuthRepositoryToken } from '../interfaces/auth.repository.interface';
import type { IAuthRepository } from '../interfaces/auth.repository.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    @Inject(IAuthRepositoryToken)
    private readonly authRepository: IAuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.refresh_token || req?.body?.refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') ?? 'super_secret_jwt_key',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string; email: string }) {
    const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
    const user = await this.authRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { user, refreshToken };
  }
}
