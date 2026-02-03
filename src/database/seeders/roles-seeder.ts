import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from '@auth/dto';
import { RoleEnum } from '@auth/enums';
import { RolesService } from '@auth/services/roles.service';
import { FontAwesome } from '@utils/api/font-awesome';

@Injectable()
export class RolesSeeder {
  constructor(private rolesService: RolesService) {}

  async run() {
    await this.createRoles();
  }

  private async createRoles() {
    const roles: CreateRoleDto[] = [];
    roles.push(
      {
        code: RoleEnum.ADMIN,
        name: 'Administrador',
        icon: FontAwesome.USER_GEAR_SOLID,
      },
      {
        code: RoleEnum.EXTERNAL,
        name: 'Usuario Externo',
        icon: FontAwesome.USER_SOLID,
      },
      {
        code: RoleEnum.TECHNICIAN,
        name: 'Técnico Zonal',
        icon: FontAwesome.CHALKBOARD_USER_SOLID,
      },
      {
        code: RoleEnum.SPECIALIST,
        name: 'Técnio Especialista',
        icon: FontAwesome.USER_LOCK_SOLID,
      },
      {
        code: RoleEnum.DAC,
        name: 'DAC',
        icon: FontAwesome.USER_SHIELD_SOLID,
      },
      {
        code: RoleEnum.GAD,
        name: 'GAD',
        icon: FontAwesome.CLIPBOARD_USER_SOLID,
      },
    );

    for (const role of roles) {
      await this.rolesService.create(role);
    }
  }
}
