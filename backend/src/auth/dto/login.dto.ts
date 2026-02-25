import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  numeroCompte?: string;

  @IsString()
  @MinLength(4)
  password: string;
}
