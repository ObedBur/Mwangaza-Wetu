import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { TypeOperationEpargne as TypeOperation, Devise } from '@prisma/client';

export { TypeOperation, Devise };

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
  @Min(1, { message: 'Le montant doit être supérieur à 0' })
  montant: number;

  @IsDateString({}, { message: 'La date doit être au format ISO (ex: 2026-03-12)' })
  @IsNotEmpty()
  dateOperation: string;

  @IsString()
  @IsOptional()
  description?: string;
}
