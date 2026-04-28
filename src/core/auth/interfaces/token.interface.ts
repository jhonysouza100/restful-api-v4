import { Role } from "../../../common/enums/roles.enum";

export interface TokenInterface {
  id: number;
  name: string;
  email: string;
  role: Role;
  picture: string;
}