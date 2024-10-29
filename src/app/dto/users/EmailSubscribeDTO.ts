import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailSubscribeDTO {
  @IsEmail(
    {},
    {
      message: 'Please enter valid email address',
    },
  )
  @IsNotEmpty()
  email: string;
}
