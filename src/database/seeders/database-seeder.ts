import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { MenusSeeder, RolesSeeder, UsersSeeder } from '@database/seeders';
import { CataloguesSeeder } from '@database/seeders/catalogues-seeder';
import { envConfig } from '@config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class DatabaseSeeder {
  constructor(
    @Inject(envConfig.KEY) private configService: ConfigType<typeof envConfig>,
    private cataloguesSeeder: CataloguesSeeder,
    private usersSeeder: UsersSeeder,
    private rolesSeeder: RolesSeeder,
    private menusSeeder: MenusSeeder,
  ) {}

  async run() {
    if (this.configService.app.env === 'local') {
      /** Auth Seeders **/
      await this.cataloguesSeeder.run();
      await this.rolesSeeder.run();
      await this.usersSeeder.run();
      await this.menusSeeder.run();
      // this.createUploadsDirectories();
    }
  }

  createUploadsDirectories() {
    const date = new Date();
    for (let i = date.getFullYear(); i < date.getFullYear() + 20; i++) {
      const path = join(process.cwd(), 'storage/private/uploads', i.toString());
      fs.mkdir(path, (err) => {
        if (err) {
          // console.error(err);
        }
      });

      for (let j = 1; j <= 12; j++) {
        const path = join(process.cwd(), 'storage/private/uploads', i.toString());
        fs.mkdir(path, (err) => {
          if (err) {
            // console.error(err);
          }
        });
      }
    }
  }
}
