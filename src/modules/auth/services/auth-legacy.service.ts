import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigEnum } from '@utils/enums';
import { CreateUserDto, SignInDto, SignUpExternalDto, UpdateUserDto } from '@auth/dto';
import { lastValueFrom } from 'rxjs';
import { envConfig } from '@config';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

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
    await this.dataSource.query(`
      UPDATE authentication.users
      SET 
        name = ' ${payload.lastname} ${payload.name}', 
        lastname = '${payload.lastname} ${payload.name}',
        email = '${payload.email}',
        username = '${payload.email}'
      where identification = '${payload.identification}'
    `);

    const user = await this.dataSource.query(
      `select id from authentication.users where identification = '${payload.identification}'`,
    );
    await this.updateRoles(payload, user);
  }

  async createUser(payload: CreateUserDto) {
    const user = await this.dataSource.query(
      `select id from authentication.users where identification = '${payload.identification}'`,
    );

    console.log('user update', user);

    if (user) {
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
      await this.dataSource.query(`
      INSERT INTO authentication.users(name, lastname, email, username)
      VALUES ('${payload.lastname} ${payload.name}', '${payload.lastname} ${payload.name}', '${payload.email}','${payload.email}')
    `);
    }

    await this.updateRoles(payload, user);
  }

  async updateRoles(payload: CreateUserDto | UpdateUserDto, user: any) {
    for (const role of payload.roles) {
      const code = this.getRole(role?.code);

      const modelHasRole = await this.dataSource.query(
        `select id from authentication.model_has_roles where model_id = ${user?.id} and role_id = ${code}`,
      );

      if (!modelHasRole) {
        await this.dataSource.query(`
          INSERT INTO authentication.model_has_roles(model_id, role_id)
          VALUES (${user?.id}, ${code})
        `);
      }
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
