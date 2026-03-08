import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

class EmailAttachments {
  @ApiProperty({
    description: 'La ruta del archivo incluyendo el nombre del mismo', 
    example: '__dirname + "/../temp/file.pdf',
    type: String, 
  }
  )
  @IsString()
  path: string;

  @ApiProperty({
    description: 'El nombre que va a tomar el archivo, si se establece el valor como false, el nombre del archivo se gerera áutomaticamente', 
    example: 'file.pdf',
    type: String, 
  }
  )
  @IsString()
  filename: string;

  @ApiProperty({
    description: 'Tipo de contenido del campo (opcional) para el archivo adjunto, si no configura, se derivará de la propriedad del nombre del archivo', 
    example: 'contentType',
    type: String, 
  }
  )
  @IsOptional()
  @IsString()
  contentType?: string;
}

export class SendEmailDto {
  @ApiProperty({ 
    description: 'Información del remitente del email',
    example: 'Nombre del Remitente'
  })
  @IsString()
  from: string;

  @ApiProperty({
    description: 'Lista de destinatarios con sus correos electrónicos y nombres',
    example: ['destinatario1@correo.com', 'destinatario2@correo.com'],
  })
  @IsArray()
  to: string[];

  @ApiProperty({
    description: 'Asunto',
    example: 'Asunto del email'
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Cuerpo HTML del email',
    example: '<h3>Hola Mundo</h3>'
  })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @ApiProperty({
    description: 'Lista de archivos adjuntos',
    type: [EmailAttachments],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAttachments)
  attachments?: EmailAttachments[];
}