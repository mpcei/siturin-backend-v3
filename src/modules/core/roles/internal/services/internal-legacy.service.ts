import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigEnum } from '@utils/enums';
import { CreateUserDto, UpdateUserDto } from '@auth/dto';
import { lastValueFrom } from 'rxjs';
import { envConfig } from '@config';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InternalUserDto } from './internal.service';
import { UserEntity } from '@auth/entities';

@Injectable()
export class InternalLegacyService {
  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE_SITURIN_OLD) private readonly dataSource: DataSource,
    @Inject(envConfig.KEY) private configService: ConfigType<typeof envConfig>,
    private readonly httpService: HttpService,
  ) {}

  async updateInternalUser(payload: InternalUserDto, user: UserEntity) {
    const userResults = await this.dataSource.query(
      `SELECT id FROM authentication.users WHERE identification = $1 LIMIT 1`,
      [user.identification],
    );
    if (!userResults || userResults.length === 0) {
      console.warn(`Usuario legacy no encontrado con identificacion: ${user.identification}`);
      return;
    }
    const legacyUserId = userResults[0].id;
    const usuarioInternos = await this.dataSource.query(
      `SELECT id FROM siturin.usuario_internos WHERE user_id = $1`,
      [legacyUserId],
    );

    if (usuarioInternos.length === 0) {
      await this.dataSource.query(
        `INSERT INTO siturin.usuario_internos(user_id, es_disponible) VALUES ($1, $2)`,
        [legacyUserId, payload.isAvailable],
      );
    } else {
      await this.dataSource.query(
        `
      UPDATE siturin.usuario_internos
      SET es_disponible = $1 
      WHERE user_id = $2
      `,
        [payload.isAvailable, legacyUserId],
      );
    }
  }
  async updateInspectionDate(
    nuevaFecha: string | Date,
    nombreComercial: string,
    actividadNombre: string,
    categoriaNombre: string,
  ) {
    const query = `
      WITH tramites_filtrados AS (
          SELECT p.id
          FROM siturin.tramites AS p
          LEFT JOIN siturin.establecimientos AS e ON e.id = p.establecimiento_id
          LEFT JOIN siturin.actividades AS a ON a.id = p.actividad_id
          LEFT JOIN siturin.categorias AS c ON c.id = p.categoria_id
          WHERE p.deleted_at IS NULL
            AND e.nombre_comercial = $2
            AND a.nombre = $3
            AND c.nombre = $4
      ),
      update_tramites AS (
          UPDATE siturin.tramites
          SET fecha_limite_inspeccion = $1
          WHERE id IN (SELECT id FROM tramites_filtrados)
          RETURNING id
      )
      UPDATE siturin.inspecciones
      SET fecha_limite = $1
      WHERE es_actual = true
        AND tramite_id IN (SELECT id FROM update_tramites);
    `;

    await this.dataSource.query(query, [
      nuevaFecha,
      nombreComercial,
      actividadNombre,
      categoriaNombre,
    ]);
  }
}
