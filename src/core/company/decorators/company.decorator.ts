import { applyDecorators, UseGuards } from '@nestjs/common';
import { CompanyGuard } from '../guards/company.guard';

export function UseCompanyGuard() {
  return applyDecorators(UseGuards(CompanyGuard));
}
