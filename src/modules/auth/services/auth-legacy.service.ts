import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigEnum } from '@utils/enums';
import { SignInDto, SignUpExternalDto, UpdateUserDto } from '@auth/dto';
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
        name = ${payload.name}, 
        lastname = ${payload.lastname},
        email = ${payload.email}
        username = ${payload.email}
      where identification = ${payload.identification}
    `);
  }
}
