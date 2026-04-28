import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    description: 'Nombre de usuario',
    type: String,
    example: 'johndoe'
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 320)
  name: string;

  @ApiProperty({ 
    description: 'Contraseña del usuario',
    type: String,
    example: '123abc'
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 12)
  password: string;
}