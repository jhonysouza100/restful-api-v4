import { ApiProperty } from "@nestjs/swagger";

export class EmailCreatedResponse {
  @ApiProperty({
    example: 'remitente@correo.com',
    description: 'Dirección del remitente'
  })
  from: string;

  @ApiProperty({
    example: ['destinatario1@correo.com', 'destinatario2@correo.com'],
    description: 'Lista de destinatarios'
  })
  to: string[];
}

export class EmailErrorResponse {
  @ApiProperty({
    example: 'Tenant identification required. Provide x-api-key header or use domain in URL'
  })
  message: string;

  @ApiProperty({
    example: 'Unauthorized'
  })
  error: string;

  @ApiProperty({
    example: 401,
  })
  statusCode: number
}