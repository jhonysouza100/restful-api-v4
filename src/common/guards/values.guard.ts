import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class HasValuesGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
			const request = context.switchToHttp().getRequest<Request>();
			const updateValueDto = request.body;

			// Verificar que al menos una propiedad esté presente en updateValueDto
			const hasValues = Object.keys(updateValueDto).length > 0;

			if (!hasValues) {
					throw new HttpException('No se proporcionaron valores de actualización', HttpStatus.NO_CONTENT);
			}

			return true; // Permite continuar con la ejecución si hay valores
    }
}
