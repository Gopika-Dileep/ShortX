import { IsUrl, IsString, IsOptional, Matches, Length } from 'class-validator';

export class ShortenUrlDto {
  @IsUrl({}, { message: 'Invalid original URL format' })
  originalUrl!: string;

  @IsOptional()
  @IsString()
  @Length(3, 15, { message: 'Custom code must be between 3 and 15 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Custom code can only contain alphanumeric characters, underscores, and hyphens',
  })
  customCode?: string;
}
