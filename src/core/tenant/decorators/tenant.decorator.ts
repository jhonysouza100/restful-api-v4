import { applyDecorators, UseGuards } from "@nestjs/common";
import { TenantGuard } from "../guards/tenant.guard";

export function UseTenantGuard() {
  return applyDecorators(
    UseGuards(TenantGuard)
  );
}