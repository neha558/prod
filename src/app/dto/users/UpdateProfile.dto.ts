import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateProfileDTO {
  @IsString()
  @IsNotEmpty()
  @Length(8, 12, {
    message: 'Username must be have  min 8 and max 12 characters',
  })
  userName: string;

  @IsString()
  @IsOptional()
  profileImage: string;

  @IsString()
  @IsOptional()
  fullName: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  bio: string;

  @IsString()
  @IsOptional()
  fbLink: string;

  @IsString()
  @IsOptional()
  instagramLink: string;

  @IsString()
  @IsOptional()
  twitterLink: string;
}
