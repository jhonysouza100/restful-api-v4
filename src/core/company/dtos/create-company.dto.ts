import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'admin123',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Correo público de contacto del company',
    example: 'company1@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  @Length(1, 320)
  email?: string;

  @ApiProperty({
    description: 'Dominio del company (ej: mycompany.com)',
    example: 'mycompany.com',
  })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty({
    description: 'URL de la imagen de perfil',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString()
  picture?: string;
}
