import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigEnum } from '@utils/enums';
import { CreateUserDto, SignInDto, SignUpExternalDto, UpdateUserDto } from '@auth/dto';
import { lastValueFrom } from 'rxjs';
import { envConfig } from '@config';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as Bcrypt from 'bcrypt';
import { UserEntity } from '@auth/entities';

@Injectable()
export class AuthLegacyService {
  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE_SITURIN_OLD) private readonly dataSource: DataSource,
    @Inject(envConfig.KEY) private configService: ConfigType<typeof envConfig>,
    private readonly httpService: HttpService,
  ) {}

  async findUserLegacy(payload: SignInDto) {
    const url = `${this.configService.externalApis.urlLegacy}/public/api/v1/public/auth/login`;

    try {
      const response = await lastValueFrom(this.httpService.post(url, payload));
      return response.data;
    } catch (error) {
      console.error('Error finding user legacy:', error);
      return null;
    }

    // return response.data;
  }

  async findUserLegacyWithoutPassword(payload: SignInDto) {
    const url = `${this.configService.externalApis.urlLegacy}/public/api/v1/public/auth/login-pass`;

    try {
      const response = await lastValueFrom(this.httpService.post(url, payload));
      return response.data;
    } catch (error) {
      console.error('Error finding user legacy:', error);
      return null;
    }

    // return response.data;
  }

  async updateUser(payload: UpdateUserDto) {
    const users = await this.dataSource.query(
      `select id from authentication.users where identification = '${payload.identification}'`,
    );

    if (users.length > 0) {
      await this.dataSource.query(`
      UPDATE authentication.users
      SET 
        name = ' ${payload.lastname} ${payload.name}', 
        lastname = '${payload.lastname} ${payload.name}',
        email = '${payload.email}',
        username = '${payload.email}'
      where identification = '${payload.identification}'
    `);

      await this.updateRoles(payload, users[0]);
    } else {
      await this.createUser(payload);
    }
  }

  async createUser(payload: CreateUserDto | UpdateUserDto) {
    let users = await this.dataSource.query(
      `select id from authentication.users where identification = '${payload.identification}'`,
    );

    if (users.length > 0) {
      await this.dataSource.query(`
      UPDATE authentication.users
      SET 
        name = ' ${payload.lastname} ${payload.name}', 
        lastname = '${payload.lastname} ${payload.name}',
        email = '${payload.email}',
        username = '${payload.email}'
      where identification = '${payload.identification}'
    `);
    } else {
      const password = Bcrypt.hashSync('Siturin.26', 10);
      await this.dataSource.query(`
      INSERT INTO authentication.users(name, lastname, email, username,password,identification)
      VALUES ('${payload.lastname} ${payload.name}', '${payload.lastname} ${payload.name}', '${payload.email}','${payload.email}','${password}','${payload.identification}')
    `);

      users = await this.dataSource.query(
        `select id from authentication.users where identification = '${payload.identification}'`,
      );
    }

    await this.updateRoles(payload, users[0]);
  }

  async createUserSignIn(payload: UserEntity) {
    const users = await this.dataSource.query(
      `select id from authentication.users where identification = '${payload.identification}'`,
    );

    if (users.length == 0) {
      const password = Bcrypt.hashSync('Siturin.26', 10);
      await this.dataSource.query(`
      INSERT INTO authentication.users(name, lastname, email, username, password, identification)
      VALUES ('${payload.name}', '${payload.name}', '${payload.email}','${payload.email}','${password}','${payload.identification}')
    `);

      const users = await this.dataSource.query(
        `select id from authentication.users where identification = '${payload.identification}'`,
      );

      await this.updateRoles(payload, users[0]);
    }
  }

  async updateRoles(payload: CreateUserDto | UpdateUserDto, user: any) {
    for (const role of payload.roles) {
      const code = this.getRole(role?.code);

      if (code) {
        if (code === 1) await this.updateExternalUsers(user);
        if (code != 1) await this.updateInternalUsers(user);

        const modelHasRoles = await this.dataSource.query(
          `select model_id from authentication.model_has_roles where model_id = ${user?.id} and role_id = ${code}`,
        );

        if (modelHasRoles.length === 0) {
          await this.dataSource.query(`
          INSERT INTO authentication.model_has_roles(model_id, role_id,model_type)
          VALUES (${user?.id}, ${code},'App\\Models\\Authentication\\User')
        `);
        }
      }
    }
  }

  async updateExternalUsers(user: any) {
    const usuarioExternos = await this.dataSource.query(
      `select id from siturin.usuario_externos where user_id = ${user?.id}`,
    );

    if (usuarioExternos.length === 0) {
      await this.dataSource.query(`
        INSERT INTO siturin.usuario_externos(user_id)
        VALUES (${user?.id})
      `);
    }
  }

  async updateInternalUsers(user: any) {
    const usuarioInternos = await this.dataSource.query(
      `select id from siturin.usuario_internos where user_id = ${user?.id}`,
    );

    if (usuarioInternos.length === 0) {
      await this.dataSource.query(`
          INSERT INTO siturin.usuario_internos(user_id, es_disponible)
          VALUES (${user?.id}, false)
      `);
    }
  }

  getRole(code: string) {
    switch (code) {
      case 'external':
        return 1;
      case 'gad':
        return 2;
      case 'technician':
        return 3;
      case 'specialist':
        return 4;
      case 'dac':
        return 5;
    }
  }
}
