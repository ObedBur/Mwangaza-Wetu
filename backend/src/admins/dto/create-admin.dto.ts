import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  telephone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  motDePasse: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @IsString()
  @IsNotEmpty()
  numeroCompte: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  actif?: boolean;
}

export class ConfirmAdminDto {
  @IsNotEmpty()
  adminId: number;

  @IsString()
  @IsNotEmpty()
  confirmationCode: string;
}
