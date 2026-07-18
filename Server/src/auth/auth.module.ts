import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User, UserSchema } from './schemas/user.schema';
import { DatabaseModule } from '../database/database.module';
import { MailModule } from '../mail/mail.module';
import { authProviders } from './auth.providers';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') ?? 'super_secret_jwt_key',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    ...authProviders,
    JwtStrategy,
    RefreshTokenStrategy,
  ],
  exports: [
    ...authProviders,
    PassportModule,
    JwtStrategy,
    RefreshTokenStrategy,
  ],
})
export class AuthModule {}
