import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { RolesArgument } from "../../../common/decorators/arguments.decorator";
import { Role } from "../../../common/enums/roles.enum";
import { BearerGuard } from "../guards/bearer.guard";
import { RolesGuard } from "../guards/roles.guard";

export function UseRoleAuthToken(roleParam?: Role) {
  return applyDecorators(
    ApiBearerAuth(),
    RolesArgument(roleParam),
    // UseGuards(CookiesGuard, RolesGuard),
    UseGuards(BearerGuard, RolesGuard),
  );
}