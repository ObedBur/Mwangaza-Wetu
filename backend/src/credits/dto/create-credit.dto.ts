import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export enum StatutCredit {
  ACTIF = 'actif',
  REMBOURSE = 'rembourse',
  EN_RETARD = 'en_retard',
}

export class CreateCreditDto {
  @IsString()
  @IsNotEmpty()
  numeroCompte: string;

  @IsNumber()
  @IsNotEmpty()
  montant: number;

  @IsString()
  @IsNotEmpty()
  devise: string;

  @IsNumber()
  @IsNotEmpty()
  tauxInteret: number;

  @IsNumber()
  @IsNotEmpty()
  duree: number;

  @IsString()
  @IsNotEmpty()
  dateDebut: string;

  @IsString()
  @IsOptional()
  description?: string;
}
