import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva', minLength: 3 })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({ example: 'joao@example.com' })
  @IsEmail()
  email!: string;
}
