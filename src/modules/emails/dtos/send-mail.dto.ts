import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

class EmailAttachmentsDto {
  @ApiProperty({
    description: 'El nombre que va a tomar el archivo, si se establece el valor como false, el nombre del archivo se gerera áutomaticamente',
    example: 'file.pdf',
  })
  filename: string;

  @ApiProperty({
    description: 'Tipo de contenido del campo (opcional) para el archivo adjunto, si no configura, se derivará de la propriedad del nombre del archivo',
    example: 'application/pdf',
  })
  contentType?: string;
}

export class SendEmailDto {
  @ApiProperty({
    description: 'Información del remitente del email',
    example: 'Nombre del Remitente'
  })
  @IsOptional()
  @IsString()
  from: string;


  @ApiProperty({
    description: 'Lista de destinatarios con sus correos electrónicos y nombres',
    example: ['destinatario1@correo.com', 'destinatario2@correo.com'],
  })
  to: string[];

  @ApiProperty({
    description: 'Asunto',
    example: 'Asunto del email'
  })
  subject: string;

  @ApiProperty({
    description: 'Cuerpo HTML del email',
    example: '<h3>Hola Mundo</h3>'
  })
  htmlContent?: string;

  @ApiProperty({
    description: 'Lista de archivos adjuntos',
    type: [EmailAttachmentsDto],
    required: false,
  })
  attachments?: EmailAttachmentsDto[];
}