import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'super_secret_jwt_key_change_me_in_production',
  expiration: process.env.JWT_EXPIRATION ?? '24h',
}));
