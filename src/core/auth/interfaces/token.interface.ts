import { Role } from '../../../common/enums/roles.enum';

export interface TokenInterface {
  id: number;
  username: string;
  email: string;
  role: Role;
  picture: string;
}
