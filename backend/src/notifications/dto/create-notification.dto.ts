import { IsInt, IsOptional, IsString, IsIn, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsInt()
  @IsOptional()
  membreId?: number;

  @IsInt()
  @IsOptional()
  adminId?: number;

  @IsString()
  @IsNotEmpty()
  titre!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsOptional()
  @IsIn(['info', 'success', 'warning', 'credit', 'epargne'])
  type?: 'info' | 'success' | 'warning' | 'credit' | 'epargne';
}

