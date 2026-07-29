import { SetMetadata } from "@nestjs/common";

import { ROLES_KEY, VALIDATION_KEY } from "../constants";
import { Role } from "../enums/roles.enum";

export const RolesArgument = (roleParam?: Role) => SetMetadata(ROLES_KEY, roleParam);

export const ValidationArgument = (validationOpt: boolean) => SetMetadata(VALIDATION_KEY, validationOpt);