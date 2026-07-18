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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    DatabaseModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [...authProviders, JwtStrategy],
  exports: [...authProviders, PassportModule, JwtStrategy],
})
export class AuthModule {}
