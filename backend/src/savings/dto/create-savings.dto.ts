import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum TypeOperation {
  DEPOT = 'depot',
  RETRAIT = 'retrait',
}

export enum Devise {
  FC = 'FC',
  USD = 'USD',
}

export class CreateSavingsDto {
  @IsString()
  @IsNotEmpty()
  compte: string;

  @IsEnum(TypeOperation)
  @IsNotEmpty()
  typeOperation: TypeOperation;

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
