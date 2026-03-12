import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { Devise } from '@prisma/client';

export class CreateWithdrawalDto {
  @IsString()
  @IsNotEmpty()
  compte: string;

  @IsEnum(Devise)
  @IsNotEmpty()
  devise: Devise;

  @IsNumber()
  @IsNotEmpty()
  montant: number;

  @IsString()
  @IsNotEmpty()
  dateOperation: string;

  @IsString()
  @IsOptional()
  description?: string;
}
