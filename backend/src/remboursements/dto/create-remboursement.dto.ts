import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRemboursementDto {
  @IsNumber()
  @IsNotEmpty()
  creditId: number;

  @IsNumber()
  @IsNotEmpty()
  montant: number;

  @IsString()
  @IsNotEmpty()
  devise: string;

  @IsString()
  @IsNotEmpty()
  dateRemboursement: string;

  @IsString()
  @IsOptional()
  description?: string;
}
