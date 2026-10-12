import { RoleEntity } from '@auth/entities';

export interface SignInInterface {
  accessToken: string;
  refreshToken: string;
  auth: AuthInterface;
  roles: RoleEntity[];
  userLegacy: any;
}

export interface AuthInterface {
  id: string;
  identification: string;
  lastname: string;
  name: string;
  username: string;
}
