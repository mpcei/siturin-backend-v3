import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CatalogueActivitiesCodeEnum, CoreRepositoryEnum } from '@modules/core/utils/enums';
import { AssignmentEntity } from '@modules/core/entities';
import { ConfigEnum, PublicRepositoryEnum } from '@utils/enums';
import { RoleEnum } from '@auth/enums';
import { ConsultaCatastroEntity } from '@modules/core/entities/consulta-catastro.entity';
import { FindCadastreDto } from '@modules/core/shared-core/dto/search-cadastre/find-cadastre.dto';

@Injectable()
export class InternalExcelSql {
  constructor(
    /*    @Inject(CoreRepositoryEnum.PROCESS_REPOSITORY)
    private readonly processRepository: Repository<ProcessEntity>,*/
    @Inject(CoreRepositoryEnum.ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepository: Repository<AssignmentEntity>,
    @Inject(PublicRepositoryEnum.CONSULTA_CATASTRO)
    private readonly consultaCatastroRepository: Repository<ConsultaCatastroEntity>,
    @Inject(ConfigEnum.PG_DATA_SOURCE) private readonly dataSource: DataSource,
  ) {}

  async findProcesses(
    userId: string,
    rolCode: string,
    isCurrent: boolean,
  ): Promise<AssignmentEntity[]> {
    return await this.assignmentRepository.find({
      where: {
        rolCode: rolCode,
        internalUser: { userId: userId },
        isCurrent: isCurrent,
        enabled: true,
      },
      relations: {
        process: {
          cadastre: { state: true },
          type: true,
          state: true,
          establishment: {
            ruc: true,
            establishmentContactPerson: true,
            credentials: { classification: true },
            province: true,
            canton: true,
            parish: true,
          },
          credentials: { classification: true },
        },
      },
    });
  }

  async findCadastres(params: FindCadastreDto): Promise<ConsultaCatastroEntity[]> {
    const { ruc, tradeName, legalName, canton, activity } = params;

    const where: FindOptionsWhere<ConsultaCatastroEntity> = {};

    if (ruc) {
      where.ruc = ruc.trim();
    }
    if (tradeName) {
      where.tradeName = ILike(`%${tradeName.trim()}%`);
    }
    if (legalName) {
      where.legalName = ILike(`%${legalName.trim()}%`);
    }
    if (canton) {
      where.canton = canton.trim();
    }
    if (activity) {
      where.activity = ILike(`%${activity.trim()}%`);
    }

    return await this.consultaCatastroRepository.find({
      where: {
        stateCadastre: ILike(`%RATIFICADO%`),
        ...where,
      },
    });
  }

  async findGuideCadastres(rolCode: string): Promise<any[]> {
    if (rolCode !== RoleEnum.DAC) {
      throw new NotFoundException({
        error: 'No tiene permisos para generar este reporte',
        message: 'Acceso denegado',
      });
    }
    return await this.dataSource.query(
      `select ruc.number as "ruc",
                establecimiento.number as "numero_establecimiento",
                estado_ruc.name as "estado_ruc",
                ruc.legal_name as "nombre_comercial",
                catastro.register_number as "numero_registro",
                catastro.registered_at as "fecha_registro",
                actividad.name as "actividad",
                credencial.clasificacion as "clasificacion",
                credencial.categoria as "categoria",
                ruc.legal_name as "razon_social",
                '' as "representante_legal",
                '' as "tipo_local",
                '' as "tipo_establecimiento",
                '' as "nombre_franquicia",
                tipo_persona.name as "tipo_persona_juridica",
                '' as "persona_juridica",
                provincia.name as "provincia",
                canton.name as "canton",
                parroquia.name as "parroquia",
                parroquia.zone_type as "tipo_parroquia",
                CONCAT(establecimiento.main_street, ', ', establecimiento.secondary_street, ', ', establecimiento.number_street) AS "direccion",
                establecimiento.reference_street as "referencia_direccion",
                establecimiento.phone as "telefono_principal",
                '' as "telefono_secundario",
                establecimiento.latitude as "latitud",
                establecimiento.longitude as "longitud",
                establecimiento.email as "correo_electronico",
                '' as "direccion_web",
                estado_registro.name as "estado_registro",
                catastro.system_origin as "sistema_origen",
                pagos.has_debt as "registro_deuda",
                proceso.total_men as "total_trabajadores_hombres",
                proceso.total_women as "total_trabajadores_mujeres",
                proceso.total_men_disability as "total_trabajadores_hombres_discapacidad",
                proceso.total_women_disability as "total_trabajadores_mujeres_discapacidad",
                COALESCE(proceso.total_men, 0) + COALESCE(proceso.total_women, 0) as "total_trabajadores",
                '' as "habitaciones",
                '' as "camas",
                '' as "plazas",
                '' as "servicios_complementarios",
                '' as  "mesas",
                '' as "capacidades",
                '' as "titulo_habilitante",
                '' as "fecha_titulo_habilitante",
                '' as "fecha_caducidad_titulo_habilitante",
                vehiculo.tipo_vehiculo as "tipo_vehiculo",
                vehiculo.matricula as "matricula",
                vehiculo.fecha_matricula as "fecha_matricula",
                vehiculo.fecha_caducidad_matricula as "fecha_caducidad_matricula",
                '' as "capacidad_unidad",
                vehiculo.total_vehiculos as "total_vehiculos",
                '' as "total_asientos_vehiculos",
                '' as "tipo_local_transporte",
                '' as "tipo_embarcaciones",
                '' as "modalidad_embarcaciones",
                '' as "matricula_embarcacion",
                '' as "total_capacidades_embarcaciones",
                '' as "total_capacidades_otras_actividades",
                '' as "anio_declaracion_tarifario_rack",
                '' as "fecha_declaracion_tarifario_rack",
                '' as "tipos_capacidades",
                '' as "cantidad_capacidad",
                '' as "plazas_capacidad",
                '' as "tarifa_tipo_capacidad",
                '' as "tipo_cocina",
                '' as "tipos_servicio",
                modalidad.modalidad as "modalidades_turismo_aventura",
                '' as "actividades_ctc",
                '' as "identificacion_guia_turismo",
                '' as "nombres_guia_turismo",
                '' as "ruc_compania_transporte",
                '' as "razon_social_compania_transporte",
                '' as "identificacion_representante_venta",
                '' as "nombre_representante_venta",
                vehiculo.placa as "placa",
                vehiculo.anio_vehiculo as "anio_vehiculo",
                licencia_conducir.name as "tipo_licencia_conducir",
                EXTRACT(YEAR FROM AGE(usuario.birthdate)) as "edad",
                nacionalidad.name as "nacionalidad",
                profesion.name as "titulo_academico",
                idioma.idioma as "idiomas",
                idioma.nivel_idioma as "nivel_idioma",
                credencial.siglas || ':' || credencial.fecha_emision as "fecha_emision_clasificacion",
                credencial.siglas || ':' || credencial.fecha_caducidad as "fecha_caducidad_clasificacion",
                '' as "poliza_seguro_accidentes",
                '' as "vigencia_poliza",
                area.area AS "areas_protegidas",
                CASE
                    WHEN area.area IS NOT NULL
                        THEN area.provincia_guia_local
                    ELSE NULL
                    END AS "provincia_area_protegida",
                CASE
                    WHEN area.area IS NULL
                        THEN area.provincia_guia_local
                    ELSE NULL
                    END AS "provincia_habilitada_guia_local",
                CASE
                    WHEN area.area IS NULL
                        THEN area.canton_guia_local
                    ELSE NULL
                    END AS "canton_habilitado_guia_local",
                '' as "persona_contacto",
                '' as "correo_persona_contacto",
                tipo_tramite.name as "tipo_tramite",
                TO_CHAR(proceso.registered_at, 'YYYY-MM-DD') as "fecha_tramite",
                '' as "modificacion_sistema",
                '' as "observaciones_modificacion_sistema",
                '' as "zona_turistica",
                '' as "administracion_zonal",
                '' as "sector_turistico"
         from core.processes proceso
                  left join core.establishments establecimiento on proceso.establishment_id = establecimiento.id
                  left join core.rucs ruc on establecimiento.ruc_id = ruc.id
                  left join auth.users usuario on ruc.number = usuario.identification
                  left join common.catalogues estado_ruc on ruc.state_id = estado_ruc.id
                  left join core.cadastres catastro on proceso.id = catastro.process_id
                  left join core.activities actividad on proceso.activity_id = actividad.id
                  left join core.classifications clasificacion on proceso.classification_id = clasificacion.id
                  left join core.categories categoria on proceso.category_id = categoria.id
                  left join common.catalogues tipo_persona on ruc.type_id = tipo_persona.id
                  left join common.catalogues licencia_conducir on proceso.driver_license_id = licencia_conducir.id
                  left join common.dpa provincia on establecimiento.province_id = provincia.id
                  left join common.dpa canton on establecimiento.canton_id = canton.id
                  left join common.dpa parroquia on establecimiento.parish_id = parroquia.id
                  left join common.catalogues estado_registro on catastro.state_id = estado_registro.id
                  left join core.payments pagos on ruc.number = pagos.number
                  left join (SELECT v.process_id,
                                    STRING_AGG(tipo_vehiculo.name, '; ')                 as tipo_vehiculo,
                                    STRING_AGG(v.registration, '; ')                     as matricula,
                                    STRING_AGG(v.registration_at::text, '; ')            as fecha_matricula,
                                    STRING_AGG(v.registration_expiration_at::text, '; ') as fecha_caducidad_matricula,
                                    STRING_AGG(v.plate, '; ')                            as placa,
                                    STRING_AGG(v.year::text, '; ')                       as anio_vehiculo,
                                    count(*)                                             as total_vehiculos
                             FROM core.land_transports v
                                      left join common.catalogues tipo_vehiculo on v.type_id = tipo_vehiculo.id
                             where v.enabled = true
                             GROUP BY v.process_id) vehiculo ON proceso.id = vehiculo.process_id
                  left join (SELECT m.establishment_id,
                                    STRING_AGG(m.modality_name, '; ')             as modalidad,
                                    STRING_AGG(m.modality_certificate_name, '; ') as certificado_modalidad
                             FROM guide.adventure_modalities m
                             where m.enabled = true
                             GROUP BY m.establishment_id) modalidad ON establecimiento.id = modalidad.establishment_id
                  left join common.catalogues tipo_sangre on usuario.blood_type_id = tipo_sangre.id
                  left join common.catalogues nacionalidad on usuario.nationality_id = nacionalidad.id
                  left join (SELECT l.establishment_id,
                                    STRING_AGG(l.language_name, '; ') as idioma,
                                    STRING_AGG(l.level_name, '; ')    as nivel_idioma
                             FROM guide.languages l
                             where l.enabled = true
                             GROUP BY l.establishment_id) idioma ON establecimiento.id = idioma.establishment_id
                  left join guide.professional_titles profesion on proceso.professional_title_id = profesion.id
                  left join (SELECT c.establishment_id,
                                    STRING_AGG(cl.name, '; ')            as clasificacion,
                                    STRING_AGG(ct.name, '; ')            as categoria,
                                    STRING_AGG(cl.acronym, '; ')         as siglas,
                                    STRING_AGG(c.started_at::text, '; ') as fecha_emision,
                                    STRING_AGG(c.ended_at::text, '; ')   as fecha_caducidad
                             FROM guide.credentials c
                                      left join core.classifications cl on c.classification_id = cl.id
                                      left join core.categories ct on c.category_id = ct.id
                             where c.enabled = true
                               and c.deleted_at is null
                             GROUP BY c.establishment_id) credencial ON establecimiento.id = credencial.establishment_id
                  left join (SELECT p.establishment_id,
                                    pr.name                       as provincia_guia_local,
                                    ca.name                       as canton_guia_local,
                                    STRING_AGG(p.area_name, '; ') as area
                             FROM guide.protected_areas p
                                      left join common.dpa pr on p.province_id = pr.id
                                      left join common.dpa ca on p.canton_id = ca.id
                             where p.enabled = true
                             GROUP BY p.establishment_id, pr.name, ca.name, pr.name, p.establishment_id) area
                            ON establecimiento.id = area.establishment_id
                  left join common.catalogues tipo_tramite on proceso.type_id = tipo_tramite.id
         where proceso.enabled = true
           and catastro.enabled = true
           and catastro.deleted_at is null
           and actividad.code = $1`,
      [CatalogueActivitiesCodeEnum.guide_continent],
    );
  }
}
