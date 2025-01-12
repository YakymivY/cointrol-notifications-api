import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
export class AddAlertDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  target_price: number;

  @IsNotEmpty()
  @IsEnum(['above', 'below'], {
    message: 'Direction must be either "above" or "below"',
  })
  direction: 'above' | 'below';

  @IsBoolean()
  active?: boolean;

  @IsBoolean()
  is_triggered?: boolean;
}
