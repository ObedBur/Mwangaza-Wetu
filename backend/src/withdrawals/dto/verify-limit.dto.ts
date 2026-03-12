import { IsNotEmpty, IsNumber, IsString, IsEnum, Min } from 'class-validator';
import { Devise } from '@prisma/client';

export class VerifyLimitDto {
  @IsString()
  @IsNotEmpty()
  compte: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.1)
  montant: number;

  @IsEnum(Devise)
  @IsNotEmpty()
  devise: Devise;
}
