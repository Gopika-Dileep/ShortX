import { IsEmail, IsString, MinLength } from 'class-validator';


export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;
}


export class ResetPasswordDto {
  @IsString()
  @MinLength(1, { message: 'Token is required' })
  token: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
