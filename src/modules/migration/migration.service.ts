import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import {
  AuthRepositoryEnum,
  CatalogueUsersSexEnum,
  CommonRepositoryEnum,
  ConfigEnum,
  GuideRepositoryEnum,
} from '@utils/enums';

import {
  CatalogueActivitiesCodeEnum,
  CatalogueCadastresStateEnum,
  CatalogueCredentialsStateEnum,
  CatalogueProcessesStateEnum,
  CatalogueProcessesTypeEnum,
  CatalogueRucTypeEnum,
  CoreCatalogueTypeEnum,
  CoreRepositoryEnum,
} from '@modules/core/utils/enums';

import * as XLSX from 'xlsx';

import {
  ActivityEntity,
  AdventureTourismModalityEntity,
  AssignmentEntity,
  BreachCauseEntity,
  CadastreEntity,
  CadastreStateEntity,
  CategoryConfigurationEntity,
  CategoryEntity,
  ClassificationEntity,
  ComplementaryServiceRegulationEntity,
  CtcActivityEntity,
  EstablishmentAddressEntity,
  EstablishmentContactPersonEntity,
  EstablishmentEntity,
  ExternalUserEntity,
  InactivationCauseEntity,
  InspectionEntity,
  InternalDpaUserEntity,
  InternalUserEntity,
  InternalZonalUserEntity,
  LandTransportEntity,
  PaymentEntity,
  ProcessAccommodationEntity,
  ProcessAgencyEntity,
  ProcessCtcEntity,
  ProcessEntity,
  ProcessEventEntity,
  ProcessFoodDrinkEntity,
  ProcessParkEntity,
  ProcessTransportEntity,
  RegulationItemEntity,
  RegulationResponseEntity,
  RegulationSectionEntity,
  RoomCapacityEntity,
  RoomEntity,
  RoomRateEntity,
  RoomTypeEntity,
  RucEntity,
  SalesRepresentativeEntity,
  TouristGuideEntity,
  TouristLicenseEntity,
  TouristTransportCompanyEntity,
  ZoneEntity,
} from '@modules/core/entities';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { DpaEntity } from '@modules/common/dpa/dpa.entity';
import { UserEntity } from '@auth/entities';
import { ObservationEntity } from '@modules/core/entities/observation.entity';
import { KitchenTypeEntity } from '@modules/core/entities/kitchen-type.entity';
import { ServiceTypeEntity } from '@modules/core/entities/service-type.entity';
import { FileEntity } from '@modules/common/file/file.entity';
import { join } from 'path';
import * as fs from 'node:fs';
import { format } from 'date-fns';
import { BucketService } from '@modules/common/bucket/bucket.service';
import { RequirementConfigurationEntity } from '@modules/core/entities/requirement-configuration.entity';
import { ModelCatalogueEntity } from '@modules/common/catalogue/model-catalogue.entity';
import { firstValueFrom, retry, timeout, timer } from 'rxjs';
import { envConfig } from '@config';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { LanguageEntity } from '@modules/core/entities/language.entity';
import { AdventureModalityEntity } from '@modules/core/entities/adventure-modality.entity';
import { ProtectedAreaEntity } from '@modules/core/entities/protected-area.entity';
import { CredentialEntity } from '@modules/core/entities/credential.entity';

@Injectable()
export class MigrationService {
  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE_SITURIN_OLD)
    private readonly dataSource: DataSource,
    @Inject(ConfigEnum.PG_DATA_SOURCE)
    private readonly dataSourceV3: DataSource,
    @Inject(CoreRepositoryEnum.OBSERVATION_REPOSITORY)
    private readonly observationRepository: Repository<ObservationEntity>,
    @Inject(CoreRepositoryEnum.ESTABLISHMENT_ADDRESS_REPOSITORY)
    private readonly establishmentAddressRepository: Repository<EstablishmentAddressEntity>,
    @Inject(CoreRepositoryEnum.ESTABLISHMENT_CONTACT_PERSON_REPOSITORY)
    private readonly establishmentContactPersonRepository: Repository<EstablishmentContactPersonEntity>,
    @Inject(CommonRepositoryEnum.CATALOGUE_REPOSITORY)
    private readonly catalogueRepository: Repository<CatalogueEntity>,
    @Inject(CoreRepositoryEnum.ZONE_REPOSITORY)
    private readonly zoneRepository: Repository<ZoneEntity>,
    @Inject(CommonRepositoryEnum.DPA_REPOSITORY)
    private readonly dpaRepository: Repository<DpaEntity>,
    @Inject(AuthRepositoryEnum.USER_REPOSITORY)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(CoreRepositoryEnum.EXTERNAL_USER_REPOSITORY)
    private readonly externalUserRepository: Repository<ExternalUserEntity>,
    @Inject(CoreRepositoryEnum.INTERNAL_USER_REPOSITORY)
    private readonly internalUserRepository: Repository<InternalUserEntity>,
    @Inject(CoreRepositoryEnum.INTERNAL_DPA_USER_REPOSITORY)
    private readonly internalDpaUserRepository: Repository<InternalDpaUserEntity>,
    @Inject(CoreRepositoryEnum.INTERNAL_ZONAL_USER_REPOSITORY)
    private readonly internalZonalUserRepository: Repository<InternalZonalUserEntity>,
    @Inject(CoreRepositoryEnum.ACTIVITY_REPOSITORY)
    private readonly activityRepository: Repository<ActivityEntity>,
    @Inject(CoreRepositoryEnum.CLASSIFICATION_REPOSITORY)
    private readonly classificationRepository: Repository<ClassificationEntity>,
    @Inject(CoreRepositoryEnum.CATEGORY_REPOSITORY)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @Inject(CoreRepositoryEnum.RUC_REPOSITORY)
    private readonly rucRepository: Repository<RucEntity>,
    @Inject(CoreRepositoryEnum.ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: Repository<EstablishmentEntity>,
    @Inject(CoreRepositoryEnum.CATEGORY_CONFIGURATION_REPOSITORY)
    private readonly categoryConfigurationRepository: Repository<CategoryConfigurationEntity>,
    @Inject(CoreRepositoryEnum.PAYMENT_REPOSITORY)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @Inject(CoreRepositoryEnum.ROOM_TYPE_REPOSITORY)
    private readonly roomTypeRepository: Repository<RoomTypeEntity>,
    @Inject(CoreRepositoryEnum.PROCESS_REPOSITORY)
    private readonly processRepository: Repository<ProcessEntity>,
    @Inject(CoreRepositoryEnum.INACTIVATION_CAUSE_REPOSITORY)
    private readonly inactivationCauseRepository: Repository<InactivationCauseEntity>,
    @Inject(CoreRepositoryEnum.BREACH_REPOSITORY)
    private readonly breachCauseRepository: Repository<BreachCauseEntity>,
    @Inject(CoreRepositoryEnum.PROCESS_FOOD_DRINK_REPOSITORY)
    private readonly processFoodDrinkRepository: Repository<ProcessFoodDrinkEntity>,
    @Inject(CoreRepositoryEnum.KITCHEN_TYPE_REPOSITORY)
    private readonly kitchenTypeRepository: Repository<KitchenTypeEntity>,
    @Inject(CoreRepositoryEnum.SERVICE_TYPE_REPOSITORY)
    private readonly serviceTypeRepository: Repository<ServiceTypeEntity>,
    @Inject(CoreRepositoryEnum.PROCESS_ACCOMMODATION_REPOSITORY)
    private readonly processAccommodationRepository: Repository<ProcessAccommodationEntity>,
    @Inject(CoreRepositoryEnum.PROCESS_CTC_REPOSITORY)
    private readonly processCtcRepository: Repository<ProcessCtcEntity>,
    @Inject(CoreRepositoryEnum.CTC_ACTIVITY_REPOSITORY)
    private readonly ctcActivityRepository: Repository<CtcActivityEntity>,
    @Inject(CoreRepositoryEnum.PROCESS_EVENT_REPOSITORY)
    private readonly processEventRepository: Repository<ProcessEventEntity>,
    @Inject(CoreRepositoryEnum.PROCESS_AGENCY_REPOSITORY)
    private readonly processAgencyRepository: Repository<ProcessAgencyEntity>,
    @Inject(CoreRepositoryEnum.PROCESS_PARK_REPOSITORY)
    private readonly processParkRepository: Repository<ProcessParkEntity>,
    @Inject(CoreRepositoryEnum.PROCESS_TRANSPORT_REPOSITORY)
    private readonly processTransportRepository: Repository<ProcessTransportEntity>,
    @Inject(CoreRepositoryEnum.LAND_TRANSPORT_REPOSITORY)
    private readonly landTransportRepository: Repository<LandTransportEntity>,
    @Inject(CoreRepositoryEnum.ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepository: Repository<AssignmentEntity>,
    @Inject(CoreRepositoryEnum.INSPECTION_REPOSITORY)
    private readonly inspectionRepository: Repository<InspectionEntity>,
    @Inject(CoreRepositoryEnum.CADASTRE_REPOSITORY)
    private readonly cadastreRepository: Repository<CadastreEntity>,
    @Inject(CoreRepositoryEnum.TOURIST_TRANSPORT_COMPANY_REPOSITORY)
    private readonly touristTransportCompanyRepository: Repository<TouristTransportCompanyEntity>,
    @Inject(CoreRepositoryEnum.TOURIST_GUIDE_REPOSITORY)
    private readonly touristGuideRepository: Repository<TouristGuideEntity>,
    @Inject(CoreRepositoryEnum.TOURIST_LICENSE_REPOSITORY)
    private readonly touristLicenseRepository: Repository<TouristLicenseEntity>,
    @Inject(CoreRepositoryEnum.ROOM_REPOSITORY)
    private readonly roomRepository: Repository<RoomEntity>,
    @Inject(CoreRepositoryEnum.ROOM_RATE_REPOSITORY)
    private readonly roomRateRepository: Repository<RoomRateEntity>,
    @Inject(CoreRepositoryEnum.ROOM_CAPACITY_REPOSITORY)
    private readonly roomCapacityRepository: Repository<RoomCapacityEntity>,
    @Inject(CoreRepositoryEnum.ADVENTURE_TOURISM_MODALITY_REPOSITORY)
    private readonly adventureTourismModalityRepository: Repository<AdventureTourismModalityEntity>,
    @Inject(CoreRepositoryEnum.COMPLEMENTARY_SERVICE_REGULATION_REPOSITORY)
    private readonly complementaryServiceRegulationRepository: Repository<ComplementaryServiceRegulationEntity>,
    @Inject(CoreRepositoryEnum.SALES_REPRESENTATIVE_REPOSITORY)
    private readonly salesRepresentativeRepository: Repository<SalesRepresentativeEntity>,
    @Inject(CommonRepositoryEnum.MODEL_CATALOGUE_REPOSITORY)
    private readonly modelCatalogueRepository: Repository<ModelCatalogueEntity>,
    @Inject(CoreRepositoryEnum.REGULATION_SECTION_REPOSITORY)
    private readonly regulationSectionRepository: Repository<RegulationSectionEntity>,
    @Inject(CoreRepositoryEnum.REGULATION_ITEM_REPOSITORY)
    private readonly regulationItemRepository: Repository<RegulationItemEntity>,
    @Inject(CoreRepositoryEnum.REGULATION_RESPONSE_REPOSITORY)
    private readonly regulationResponseRepository: Repository<RegulationResponseEntity>,
    @Inject(CommonRepositoryEnum.FILE_REPOSITORY)
    private readonly fileRepository: Repository<FileEntity>,
    @Inject(GuideRepositoryEnum.REQUIREMENT_CONFIGURATION_REPOSITORY)
    private readonly requirementConfigurationRepository: Repository<RequirementConfigurationEntity>,
    @Inject(envConfig.KEY) private configService: ConfigType<typeof envConfig>,
    private readonly httpService: HttpService,
    private readonly bucketService: BucketService,
  ) {}

  async getData(table: string): Promise<any> {
    return await this.dataSource.query(`
      SELECT *
      FROM ${table}
    `);
  }

  async getProcesses(): Promise<any> {
    return await this.dataSource.query(`
      SELECT *
      FROM siturin.tramites t
             inner join siturin.catastros c on c.tramite_id = t.id
      where tipo_id <> 46
        and c.user_id is null;
    `);
  }

  async getProcessAddresses(): Promise<any> {
    return await this.dataSource.query(`
      SELECT *
      FROM siturin.tramites t
             inner join siturin.catastros c on c.tramite_id = t.id
      where tipo_id <> 46
        and c.user_id is null
        and t.ubicacion is not null
      ;
    `);
  }

  async getProcessContactPerson(): Promise<any> {
    return await this.dataSource.query(`
      SELECT *
      FROM siturin.tramites t
             inner join siturin.catastros c on c.tramite_id = t.id
      where tipo_id <> 46
        and c.user_id is null
        and t.persona_contacto is not null limit 100
      ;
    `);
  }

  async migrateCatalogues() {
    await this.cleanCatalogues();

    const data = await this.getData('siturin.catalogos');

    for (const item of data) {
      const entity = this.catalogueRepository.create();
      entity.createdAt = item.created_at || new Date();
      entity.updatedAt = item.updated_at || new Date();
      entity.deletedAt = item.deleted_at;
      entity.enabled = item.es_visible;

      entity.idTemp = item.id;
      entity.idTempParent = item.padre_id;
      entity.code = item.codigo;
      entity.description = item.descripcion;
      entity.name = item.nombre;
      entity.type = item.tipo;
      entity.acronym = item.acronimo;
      entity.required = false;

      await this.catalogueRepository.save(entity);
    }

    const catalogues = await this.catalogueRepository.find({
      where: { idTempParent: Not(IsNull()) },
    });

    for (const item of catalogues) {
      const parent = await this.catalogueRepository.findOne({
        where: { idTemp: item.idTempParent },
      });

      if (parent) item.parentId = parent.id;

      await this.catalogueRepository.save(item);
    }

    await this.updateTypeCatalogues();

    await this.migratePersoneriaJuridicas();
    await this.migrateCatastroEstados();

    return { data: null };
  }

  async cleanCatalogues() {
    await this.dataSource.query(`
      UPDATE siturin.normativas
      SET tipo_id = NULL
    `);

    await this.dataSource.query(`
      DELETE FROM siturin.catalogos
      WHERE tipo IN (
        'ruc_clases_contribuyentes',
        'ruc_estados',
        'ruc_subtipos_contribuyentes',
        'ruc_tipos',
        'sexos'
      )
    `);

    return { ok: true };
  }

  async migrateZones() {
    const data = await this.getData('siturin.zonales');

    for (const item of data) {
      const entity = this.zoneRepository.create();
      entity.createdAt = item.created_at || new Date();
      entity.updatedAt = item.updated_at || new Date();
      entity.deletedAt = item.deleted_at;
      entity.enabled = item.es_visible;
      entity.idTemp = item.id;

      entity.acronym = item.siglas;
      entity.address = item.direccion;
      entity.director = item.director;
      entity.name = item.nombre;
      entity.code = item.numero;
      entity.email = item.correos[0];
      entity.latitude = item.latitud;
      entity.longitude = item.longitud;
      entity.phone = item.telefono;

      await this.zoneRepository.save(entity);
    }

    return { data: null };
  }

  async migrateDPA() {
    const data = await this.getData('siturin.dpa');

    for (const item of data) {
      const entity = this.dpaRepository.create();
      entity.createdAt = item.created_at || new Date();
      entity.updatedAt = item.updated_at || new Date();
      entity.deletedAt = item.deleted_at;
      entity.enabled = item.es_visible;
      entity.idTemp = item.id;

      entity.idTempParent = item.padre_id;
      entity.code = item.codigo;
      entity.name = item.nombre;
      entity.latitude = item.latitud;
      entity.longitude = item.longitud;
      entity.zoneType = item.tipo_zona;

      const type = await this.catalogueRepository.findOneBy({
        idTemp: item.tipo_id,
      });

      if (type) entity.typeId = type.id;

      const zone = await this.zoneRepository.findOneBy({
        idTemp: item.zonal_id,
      });

      if (zone) entity.zoneId = zone.id;

      await this.dpaRepository.save(entity);
    }

    const dpa = await this.dpaRepository.find({
      where: { idTempParent: Not(IsNull()) },
    });

    for (const item of dpa) {
      const parent = await this.dpaRepository.findOne({
        where: { idTemp: item.idTempParent },
      });

      if (parent) item.parentId = parent.id;

      await this.dpaRepository.save(item);
    }

    return { data: null };
  }

  async migrateUsers() {
    const data = await this.getData('authentication.users');

    for (const item of data) {
      let entity = await this.userRepository.findOneBy({
        identification: item.identification,
      });

      if (!entity) {
        console.log(item.identification);
        entity = this.userRepository.create();
        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;
        entity.email = item.email;
        entity.identification = item.identification;
        entity.maxAttempts = item.max_attempts;
        entity.name = item.name;
        entity.username = item.email;
        entity.password = item.identification;

        await this.userRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateExternalUsers() {
    const data = await this.getData('siturin.usuario_externos');
    const externalUsers = await this.externalUserRepository.find({withDeleted:true});
    const users = await this.userRepository.find({withDeleted:true});

    for (const item of data) {
      console.log(item.id);
      const exists = externalUsers.find((register) => register.idTemp == item.id);

      if (!exists) {
        const user = users.find((user) => user.idTemp == item.user_id);
        const entity = this.externalUserRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.enabled = item.es_visible;
        entity.idTemp = item.id;

        if (user) entity.userId = user.id;

        await this.externalUserRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateInternalUsers() {
    const data = await this.getData('siturin.usuario_internos');
    const internalUsers = await this.internalUserRepository.find({withDeleted:true});
    const users = await this.userRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = internalUsers.find((register) => register.idTemp == item.id);

      if (!exists) {
        const user = users.find((user) => user.idTemp == item.user_id);
        const entity = this.internalUserRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.enabled = item.es_visible;
        entity.idTemp = item.id;

        entity.isAvailable = item.es_disponible;

        if (user) entity.userId = user.id;

        await this.internalUserRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateInternalDPAUsers() {
    const data = await this.getData('siturin.usuario_interno_dpa');
    const internalDPAUsers = await this.internalDpaUserRepository.find({withDeleted:true});
    const internalUsers = await this.internalUserRepository.find({withDeleted:true});
    const dpas = await this.dpaRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = internalDPAUsers.find((register) => register.idTemp == item.id);

      if (!exists) {
        const internalUser = internalUsers.find(
          (register) => register.idTemp == item.usuario_interno_id,
        );
        const dpa = dpas.find((register) => register.idTemp == item.dpa_id);
        const entity = this.internalDpaUserRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.enabled = item.es_visible;
        entity.idTemp = item.id;

        entity.hasProcess = item.tiene_tramite;

        if (internalUser) entity.internalUserId = internalUser.id;
        if (dpa) entity.dpaId = dpa.id;

        await this.internalDpaUserRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateInternalZonalUsers() {
    const data = await this.getData('siturin.usuario_interno_zonal');
    const internalZonalUsers = await this.internalZonalUserRepository.find({withDeleted:true});
    const internalUsers = await this.internalUserRepository.find({withDeleted:true});
    const zones = await this.zoneRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = internalZonalUsers.find((register) => register.idTemp == item.id);

      if (!exists) {
        const internalUser = internalUsers.find(
          (register) => register.idTemp == item.usuario_interno_id,
        );
        const zone = zones.find((register) => register.idTemp == item.zonal_id);

        const entity = this.internalZonalUserRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.enabled = item.es_visible;
        entity.idTemp = item.id;

        if (internalUser) entity.internalUserId = internalUser.id;
        if (zone) entity.zoneId = zone.id;

        await this.internalZonalUserRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateActivities() {
    const data = await this.getData('siturin.actividades');

    const activities = await this.activityRepository.find({withDeleted:true});
    const catalogues = await this.catalogueRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = activities.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.activityRepository.create();
        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.enabled = item.es_visible;
        entity.idTemp = item.id;

        entity.code = item.codigo;
        entity.name = item.nombre;
        entity.sort = item.orden;

        const geographicArea = catalogues.find((x) => x.idTemp == item.zona_geografica_id);

        if (geographicArea) entity.geographicAreaId = geographicArea.id;

        await this.activityRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateClassifications() {
    const data = await this.getData('siturin.clasificaciones');

    const classifications = await this.classificationRepository.find({withDeleted:true});
    const activities = await this.activityRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = classifications.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.classificationRepository.create();
        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.enabled = item.es_visible;
        entity.idTemp = item.id;

        entity.code = item.codigo;
        entity.isComplementaryService = item.es_servicio_complementario;
        entity.maxRooms = item.max_habitaciones;
        entity.minRooms = item.min_habitaciones;
        entity.maxPlaces = item.max_plazas;
        entity.minPlaces = item.min_plazas;
        entity.name = item.nombre;
        entity.sort = item.orden;
        entity.hasRegulation = item.tiene_normativa || false;
        entity.hasCategorization = item.tiene_categorizacion || false;

        const activity = activities.find((x) => x.idTemp == item.actividad_id);

        if (activity) entity.activityId = activity.id;

        await this.classificationRepository.save(entity);

        if (Array.isArray(item.capacidades_comentarios)) {
          for (const cc of item.capacidades_comentarios) {
            const observation = this.observationRepository.create();
            observation.modelId = entity.id;
            observation.name = cc;
            await this.observationRepository.save(observation);
          }
        }
      }
    }

    await this.updateClassificationCodes();

    return { data: null };
  }

  async migrateCategories() {
    const data = await this.getData('siturin.categorias');

    const categories = await this.categoryRepository.find({withDeleted:true});
    const classifications = await this.classificationRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = categories.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.categoryRepository.create();
        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.enabled = item.es_visible;
        entity.idTemp = item.id;

        entity.name = item.nombre;
        entity.sort = item.orden;
        entity.hasRegulation = item.tiene_normativa || false;

        const classification = classifications.find((x) => x.idTemp == item.clasificacion_id);

        if (classification) entity.classificationId = classification.id;

        await this.categoryRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateRucs() {
    const data = await this.getData('siturin.rucs');
    const table = await this.rucRepository.find({withDeleted:true});
    const catalogues = await this.catalogueRepository.find({withDeleted:true});

    for (const item of data) {
      //ruc sin user
      let entityUser = await this.userRepository.findOneBy({
        identification: item.numero,
      });

      if (!entityUser) {
        entityUser = this.userRepository.create();
        entityUser.createdAt = item.created_at || new Date();
        entityUser.updatedAt = item.updated_at || new Date();
        entityUser.deletedAt = item.deleted_at;
        entityUser.idTemp = item.id;
        entityUser.email = `${item.numero}@migradositurin.com`;
        entityUser.identification = item.numero;
        entityUser.maxAttempts = 5;
        entityUser.name = item.razon_social;
        entityUser.username = `${item.numero}@migradositurin.com`;
        entityUser.password = item.numero;

        await this.userRepository.save(entityUser);
      }

      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.rucRepository.create();
        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;
        entity.mainEconomicActivity = item.actividad_economica_principal;
        entity.legalRepresentativeIdentification = item.representante_legal_identificacion;
        entity.legalRepresentativeNames = item.representante_legal_nombres;
        entity.number = item.numero;
        entity.companyRegistrationNumber = item.numero_expediente_supercias;
        entity.legalName = item.razon_social;
        entity.lastUpdatedAt = item.fecha_actualizacion;
        entity.activitiesStartedAt = item.fecha_inicio_actividades;

        const state = catalogues.find((x) => x.idTemp == item.estado_contribuyente_id);

        if (state) entity.stateId = state.id;

        const type = catalogues.find((x) => x.idTemp == item.tipo_contribuyente_id);

        if (type) entity.typeId = type.id;

        const legalEntity = catalogues.find((x) => x.idTemp == item.personeria_juridica_id);

        if (legalEntity) entity.legalEntityId = legalEntity.id;

        await this.rucRepository.save(entity);
      }
    }
    return { data: null };
  }

  async migrateEstablishments() {
    const data = await this.getData('siturin.establecimientos');

    const establishments = await this.establishmentRepository.find({withDeleted:true});
    const rucs = await this.rucRepository.find({withDeleted:true});
    const catalogues = await this.catalogueRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = establishments.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.establishmentRepository.create();
        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.enabled = item.es_visible;
        entity.idTemp = item.id;

        entity.tradeName = item.nombre_comercial;
        entity.number = item.numero;
        entity.webPage = item.pagina_web;

        const ruc = rucs.find((x) => x.idTemp == item.ruc_id);

        if (ruc) entity.rucId = ruc.id;

        const state = catalogues.find((x) => x.idTemp == item.estado_id);
        if (state) entity.stateId = state.id;

        await this.establishmentRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateCategoryConfigurations() {
    const data = await this.getData('siturin.configuracion_categorias');
    const categoryConfigurations = await this.categoryConfigurationRepository.find({withDeleted:true});
    const classifications = await this.classificationRepository.find({withDeleted:true});
    const categories = await this.categoryRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = categoryConfigurations.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.categoryConfigurationRepository.create();
        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.min = item.min;
        entity.max = item.orden;
        entity.sort = item.orden;

        const classification = classifications.find((x) => x.idTemp == item.clasificacion_id);
        if (classification) entity.classificationId = classification.id;

        const category = categories.find((x) => x.idTemp == item.categoria_id);
        if (category) entity.categoryId = category.id;

        await this.categoryConfigurationRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migratePayments() {
    const data = await this.getData('siturin.pagos');
    const table = await this.paymentRepository.find({withDeleted:true});
    const rucs = await this.rucRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.paymentRepository.create();
        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.hasDebt = item.tiene_deuda;
        entity.registeredAt = item.updated_at || null;

        entity.ruc = item.ruc;

        // let ruc = rucs.find((x) => x.number == item.ruc);
        //
        // if (!ruc) {
        //   ruc = this.rucRepository.create();
        //   ruc.idTemp = item.id;
        //   ruc.number = item.ruc;
        //   ruc = await this.rucRepository.save(ruc);
        // }
        //
        // entity.rucId = ruc.id;

        await this.paymentRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateRoomTypes() {
    const data = await this.getData('siturin.tipo_habitaciones');
    const table = await this.roomTypeRepository.find({withDeleted:true});
    const catalogues = await this.catalogueRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.roomTypeRepository.create();
        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.code = item.codigo;
        entity.isBed = item.es_cama;
        entity.isRoom = item.es_habitacion;
        entity.isPlace = item.es_plaza;
        entity.name = item.nombre;

        const geographicArea = catalogues.find((x) => x.idTemp == item.zona_geografica_id);

        if (geographicArea) {
          entity.geographicAreaId = geographicArea.id;
        }

        await this.roomTypeRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateProcesses() {
    const data = await this.getProcesses();

    const table = await this.processRepository.find({withDeleted:true});
    const catalogues = await this.catalogueRepository.find({withDeleted:true});
    const activities = await this.activityRepository.find({withDeleted:true});
    const classifications = await this.classificationRepository.find({withDeleted:true});
    const categories = await this.categoryRepository.find({withDeleted:true});
    const establishments = await this.establishmentRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.processRepository.create();
        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        const activity = activities.find((x) => x.idTemp == item.actividad_id);
        const classification = classifications.find((x) => x.idTemp == item.clasificacion_id);
        const category = categories.find((x) => x.idTemp == item.categoria_id);
        const state = catalogues.find((x) => x.idTemp == item.estado_id);
        const type = catalogues.find((x) => x.idTemp == item.tipo_id);
        const causeInactivationType = catalogues.find(
          (x) => x.idTemp == item.tipo_causa_inactivacion_id,
        );
        const establishment = establishments.find((x) => x.idTemp == item.establecimiento_id);
        const legalEntity = catalogues.find((x) => x.idTemp == item.personeria_juridica_id);
        const localType = catalogues.find((x) => x.idTemp == item.tipo_local_id);

        if (activity) entity.activityId = activity.id;
        if (classification) entity.classificationId = classification.id;
        if (category) entity.categoryId = category.id;
        if (state) entity.stateId = state.id;
        if (type) entity.typeId = type.id;
        if (causeInactivationType) entity.inactivationCauseTypeId = causeInactivationType.id;
        if (establishment) entity.establishmentId = establishment.id;
        if (legalEntity) entity.legalEntityId = legalEntity.id;
        if (localType) entity.localTypeId = localType.id;

        entity.registeredAt = item.fecha;
        entity.hasTouristActivityDocument = item.tiene_documento_actividad_turistica || false;
        entity.hasPersonDesignation = item.tiene_nombramiento_vigente || false;
        entity.totalMen = item.total_hombres || 0;
        entity.totalWomen = item.total_mujeres || 0;
        entity.totalMenDisability = item.total_hombres_discapacidad || 0;
        entity.totalWomenDisability = item.total_mujeres_discapacidad || 0;
        entity.hasLandUse = item.uso_suelos || false;
        entity.attendedAt = item.fecha_atendido;
        entity.isProtectedArea = item.es_area_protegida ?? false;
        entity.hasProtectedAreaContract = item.contrato_area_protegida;
        entity.inspectionExpirationAt = item.fecha_limite_inspeccion;

        await this.processRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateProcessAddresses() {
    const data = await this.getProcessAddresses();

    const dpa = await this.dpaRepository.find({withDeleted:true});
    const establishments = await this.establishmentRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});

    for (const item of data) {
      const entity = this.establishmentAddressRepository.create();

      const province = dpa.find((x) => x.idTemp == item.provincia_id);
      const canton = dpa.find((x) => x.idTemp == item.canton_id);
      const parish = dpa.find((x) => x.idTemp == item.parroquia_id);
      const establishment = establishments.find((x) => x.idTemp == item.establecimiento_id);
      const process = processes.find((x) => x.idTemp == item.id);

      if (!establishment) {
        throw new Error('Establishment not found');
      }

      entity.createdAt = item.created_at || new Date();
      entity.updatedAt = item.updated_at || new Date();

      entity.isCurrent = false;

      if (!item.deleted_at) entity.isCurrent = true;

      entity.establishmentId = establishment?.id!;
      entity.processId = process?.id!;
      entity.provinceId = province?.id!;
      entity.cantonId = canton?.id!;
      entity.parishId = parish?.id!;

      establishment.provinceId = province?.id!;
      establishment.cantonId = canton?.id!;
      establishment.parishId = parish?.id!;

      if (item.ubicacion) {
        if (item.ubicacion.callePrincipal) {
          entity.mainStreet = item.ubicacion.callePrincipal;
          entity.secondaryStreet = item.ubicacion.calleInterseccion;
          entity.numberStreet = item.ubicacion.calleNumeracion;

          establishment.mainStreet = item.ubicacion.callePrincipal;
          establishment.secondaryStreet = item.ubicacion.calleInterseccion;
          establishment.numberStreet = item.ubicacion.calleNumeracion;
        } else {
          entity.mainStreet = item.ubicacion.direccion;
          establishment.mainStreet = item.ubicacion.direccion;
        }

        entity.referenceStreet = item.ubicacion.calleReferencia;
        establishment.referenceStreet = item.ubicacion.calleReferencia;

        const isNumeric = (value: unknown): boolean => {
          return /^-?\d+(\.\d+)?$/.test(String(value ?? '').trim());
        };

        entity.latitude = isNumeric(item.ubicacion.latitud) ? Number(item.ubicacion.latitud) : 0;
        establishment.latitude = isNumeric(item.ubicacion.latitud)
          ? Number(item.ubicacion.latitud)
          : 0;

        entity.longitude = isNumeric(item.ubicacion.longitud) ? Number(item.ubicacion.longitud) : 0;
        establishment.longitude = isNumeric(item.ubicacion.longitud)
          ? Number(item.ubicacion.longitud)
          : 0;

        await this.establishmentRepository.save(establishment);
        await this.establishmentAddressRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateProcessContactPersons() {
    const data = await this.getProcessContactPerson();

    const establishments = await this.establishmentRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});

    for (const item of data) {
      const entity = this.establishmentContactPersonRepository.create();

      const establishment = establishments.find((x) => x.idTemp == item.establecimiento_id);
      const process = processes.find((x) => x.idTemp == item.id);

      entity.createdAt = item.created_at || new Date();
      entity.updatedAt = item.updated_at || new Date();

      entity.isCurrent = false;

      if (!item.deleted_at) entity.isCurrent = true;

      entity.establishmentId = establishment?.id!;
      entity.processId = process?.id!;

      if (item.persona_contacto) {
        if (item.persona_contacto.identificacion) {
          entity.identification = item.persona_contacto.identificacion;
        }

        if (item.persona_contacto.nombres) {
          entity.name = item.persona_contacto.nombres;
        }

        if (item.persona_contacto.telefonoPrincipal) {
          entity.phone = item.persona_contacto.telefonoPrincipal;
        }

        if (item.persona_contacto.telefonoSecundario) {
          entity.secondaryPhone = item.persona_contacto.telefonoSecundario;
        }

        if (item.persona_contacto.correo) {
          entity.email = item.persona_contacto.correo;
        }

        const x = await this.establishmentContactPersonRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateProcessFoodDrinks() {
    const data = await this.getData('siturin.tramite_alimentos_bebidas');

    const table = await this.processFoodDrinkRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});
    const catalogues = await this.catalogueRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.processFoodDrinkRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.establishmentName = item.nombre_establecimiento;
        entity.hasFranchiseGrantCertificate = item.tiene_certificado_concesion_franquicia;
        entity.score = item.puntaje;
        entity.totalTables = item.total_mesas;
        entity.totalCapacities = item.total_capacidades;

        const process = processes.find((x) => x.idTemp == item.tramite_id);

        const establishmentType = catalogues.find((x) => x.idTemp == item.tipo_establecimiento_id);

        if (process) entity.processId = process.id;

        if (establishmentType) entity.establishmentTypeId = establishmentType.id;

        await this.processFoodDrinkRepository.save(entity);

        if (Array.isArray(item.tipos_cocina)) {
          for (const tc of item.tipos_cocina) {
            if (tc?.codigo) {
              const kitchenType = this.kitchenTypeRepository.create();
              kitchenType.idTemp = item.id;
              kitchenType.code = tc.codigo;
              kitchenType.name = tc.nombre;

              if (process) kitchenType.processId = process.id;

              await this.kitchenTypeRepository.save(kitchenType);
            }
          }
        }

        if (Array.isArray(item.tipos_servicio)) {
          for (const ts of item.tipos_servicio) {
            if (ts?.codigo) {
              const serviceType = this.serviceTypeRepository.create();
              serviceType.idTemp = item.id;
              serviceType.code = ts.codigo;
              serviceType.name = ts.nombre;
              if (process) serviceType.processId = process.id;

              await this.serviceTypeRepository.save(serviceType);
            }
          }
        }
      }
    }

    return { data: null };
  }

  async migrateProcessAccommodation() {
    const data = await this.getData('siturin.tramite_alojamientos');

    const table = await this.processAccommodationRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.processAccommodationRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.inactivationCode = item.codigo_inactivacion;
        entity.inactivationAt = item.fecha_inactivacion;
        entity.rackYear = item.anio_rack;
        entity.declarationAt = item.fecha_declaracion;

        const process = processes.find((x) => x.idTemp == item.tramite_id);

        if (process) entity.processId = process.id;

        await this.processAccommodationRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateProcessEvents() {
    const data = await this.getData('siturin.tramite_eventos');

    const table = await this.processEventRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.processEventRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.totalCapacities = item.total_capacidades;

        const process = processes.find((x) => x.idTemp == item.tramite_id);

        if (process) entity.processId = process.id;

        await this.processEventRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateProcessCtc() {
    const data = await this.getData('siturin.tramite_ctc');

    const table = await this.processCtcRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.processCtcRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.totalBeds = item.total_camas;
        entity.totalCapacities = item.total_capacidades;
        entity.totalRooms = item.total_habitaciones;
        entity.totalTables = item.total_mesas;
        entity.totalPlaces = item.total_plazas;
        entity.hasPropertyRegistrationCertificate = item.tiene_certificado_registro_propiedad;
        entity.hasTechnicalReport = item.tiene_informe_tecnico;
        entity.hasStatute = item.tiene_estatuo;

        const process = processes.find((x) => x.idTemp == item.tramite_id);

        if (process) entity.processId = process.id;

        await this.processCtcRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateProcessAgencies() {
    const data = await this.getData('siturin.tramite_operaciones_intermediaciones');

    const table = await this.processAgencyRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});
    const catalogues = await this.catalogueRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.processAgencyRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.totalAccreditedStaffLanguage = item.personal_acreditado_idioma;

        const process = processes.find((x) => x.idTemp == item.tramite_id);
        const permanentPhysicalSpace = catalogues.find(
          (x) => x.idTemp == item.espacio_fisico_permanente_id,
        );

        if (process) entity.processId = process.id;
        if (permanentPhysicalSpace) entity.permanentPhysicalSpaceId = permanentPhysicalSpace.id;

        await this.processAgencyRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateProcessParks() {
    const data = await this.getData('siturin.tramite_parques');

    const table = await this.processParkRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.processParkRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.totalCapacities = item.total_capacidades;

        const process = processes.find((x) => x.idTemp == item.tramite_id);

        if (process) entity.processId = process.id;

        await this.processParkRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateProcessTransports() {
    const data = await this.getData('siturin.tramite_transportes');

    const table = await this.processTransportRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});
    const catalogues = await this.catalogueRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.processTransportRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.certified = item.certificado;
        entity.certifiedCode = item.codigo_certificado;
        entity.certifiedIssueAt = item.fecha_emision_certificado;
        entity.certifiedExpirationAt = item.fecha_caducidad_certificado;
        entity.totalUnits = item.total_unidades;
        entity.totalSeats = item.total_asientos;

        const process = processes.find((x) => x.idTemp == item.tramite_id);
        const airlineType = catalogues.find((x) => x.idTemp == item.tipo_aerolinea_id);

        if (process) entity.processId = process.id;
        if (airlineType) entity.airlineTypeId = airlineType.id;

        await this.processTransportRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateAssignments() {
    const data = await this.getData('siturin.asignaciones');

    const table = await this.assignmentRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});
    const dpas = await this.dpaRepository.find({withDeleted:true});
    const internalUsers = await this.internalUserRepository.find({withDeleted:true});
    const zones = await this.zoneRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.assignmentRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.isCurrent = item.es_actual;
        entity.registeredAt = item.fecha;

        const process = processes.find((x) => x.idTemp == item.tramite_id);
        const dpa = dpas.find((x) => x.idTemp == item.dpa_id);
        const internalUser = internalUsers.find((x) => x.idTemp == item.usuario_interno_id);
        const zone = zones.find((x) => x.idTemp == item.zonal_id);

        if (process) entity.processId = process.id;
        if (dpa) entity.dpaId = dpa.id;
        if (internalUser) entity.internalUserId = internalUser.id;
        // if (zone) entity.zoneId = zone.id;

        await this.assignmentRepository.save(entity);

        if (Array.isArray(item.observaciones)) {
          for (const cc of item.observaciones) {
            const observation = this.observationRepository.create();
            observation.modelId = entity.id;
            observation.name = cc;
            await this.observationRepository.save(observation);
          }
        }
      }
    }

    return { data: null };
  }

  async migrateCtcActivities() {
    const data = await this.getData('siturin.ctc_actividades');

    const table = await this.ctcActivityRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});
    const catalogues = await this.catalogueRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.ctcActivityRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        const process = processes.find((x) => x.idTemp == item.tramite_id);
        const activity = catalogues.find((x) => x.idTemp == item.actividad_id);

        if (process) entity.processId = process.id;
        if (activity) entity.activityId = activity.id;

        await this.ctcActivityRepository.save(entity);
      }
    }

    await this.updateActivityCodes();

    return { data: null };
  }

  async migrateTouristGuides() {
    const data = await this.getData('siturin.guia_turismos');

    const table = await this.touristGuideRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.touristGuideRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.isGuide = item.es_guia;
        entity.identification = item.cedula;
        entity.name = item.nombres;

        const process = processes.find((x) => x.idTemp == item.tramite_id);

        if (process) entity.processId = process.id;

        await this.touristGuideRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateRooms() {
    const data = await this.getData('siturin.habitaciones');

    const table = await this.roomRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.roomRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.totalBeds = item.camas;
        entity.totalPlaces = item.plazas;
        entity.totalRooms = item.habitaciones;

        const process = processes.find((x) => x.idTemp == item.tramite_id);

        if (process) entity.processId = process.id;

        await this.roomRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateRoomRates() {
    const data = await this.getData('siturin.habitacion_tarifas');

    const table = await this.roomRateRepository.find({withDeleted:true});
    const rooms = await this.roomRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.roomRateRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.highRoom = item.habitacion_temporada_alta;
        entity.lowRoom = item.habitacion_temporada_baja;
        entity.highPerson = item.persona_temporada_alta;
        entity.lowPerson = item.persona_temporada_baja;
        entity.year = item.anio;
        entity.declarationAt = item.fecha_declaracion;

        const room = rooms.find((x) => x.idTemp == item.habitacion_id);

        if (room) entity.roomId = room.id;

        await this.roomRateRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateRoomCapacities() {
    const data = await this.getData('siturin.capacidad_habitaciones');

    const table = await this.roomCapacityRepository.find({withDeleted:true});
    const categories = await this.categoryRepository.find({withDeleted:true});
    const roomTypes = await this.roomTypeRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.roomCapacityRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        const category = categories.find((x) => x.idTemp == item.categoria_id);
        const roomType = roomTypes.find((x) => x.idTemp == item.tipo_habitacion_id);

        if (category) entity.categoryId = category.id;
        if (roomType) entity.roomTypeId = roomType.id;

        await this.roomCapacityRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateInspections() {
    const data = await this.getData('siturin.inspecciones');

    const table = await this.inspectionRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});
    const internalUsers = await this.internalUserRepository.find({withDeleted:true});
    const catalogues = await this.catalogueRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.inspectionRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.isCurrent = item.camas;
        entity.inspectionAt = item.habitaciones;

        const process = processes.find((x) => x.idTemp == item.tramite_id);
        const internalUser = internalUsers.find((x) => x.idTemp == item.usuario_interno_id);
        const state = catalogues.find((x) => x.idTemp == item.estado_fecha_id);

        if (process) entity.processId = process.id;
        if (state) entity.stateId = state.id;

        await this.inspectionRepository.save(entity);

        if (Array.isArray(item.observaciones)) {
          for (const cc of item.observaciones) {
            const observation = this.observationRepository.create();
            observation.modelId = entity.id;
            observation.name = cc;
            await this.observationRepository.save(observation);
          }
        }
      }
    }

    return { data: null };
  }

  async migrateTouristLicenses() {
    const data = await this.getData('siturin.licencias');

    const table = await this.touristLicenseRepository.find({withDeleted:true});
    const touristGuides = await this.touristGuideRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.touristLicenseRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.code = item.codigo;
        entity.classification = item.clasificacion;
        entity.expirationAt = item.fecha_caducidad;
        entity.issueAt = item.fecha_emision;

        const touristGuide = touristGuides.find((x) => x.idTemp == item.guia_turismo_id);

        if (touristGuide) entity.touristGuideId = touristGuide.id;

        await this.touristLicenseRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateAdventureTourismModalities() {
    const data = await this.getData('siturin.modalidad_turismo_aventuras');

    const table = await this.adventureTourismModalityRepository.find({ withDeleted: true });
    const processes = await this.processRepository.find({ withDeleted: true });
    const catalogues = await this.catalogueRepository.find({ withDeleted: true });
    console.log(processes.length);
    for (const item of data) {
      console.log(item.id);

      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.adventureTourismModalityRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        const process = processes.find((x) => x.idTemp == item.tramite_id);
        console.log(item.tramite_id);
        console.log(process?.id);
        const type = catalogues.find((x) => x.idTemp == item.tipo_id);

        const parent = catalogues.find((x) => x.idTemp == item.padre_id);

        if (process) entity.processId = process.id;

        if (parent) {
          entity.className = parent.name;
        }

        if (type) {
          entity.code = type.code;
          entity.name = type.name;
        }

        await this.adventureTourismModalityRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateSalesRepresentatives() {
    const data = await this.getData('siturin.representante_ventas');

    const table = await this.salesRepresentativeRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.salesRepresentativeRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.legalName = item.razon_social;
        entity.ruc = item.ruc;
        entity.hasProfessionalDegree = item.tiene_titulo_profesional;
        entity.hasContract = item.tiene_contrato;
        entity.hasWorkExperience = item.tiene_experiencia_profesional;

        const process = processes.find((x) => x.idTemp == item.tramite_id);

        if (process) entity.processId = process.id;

        await this.salesRepresentativeRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateLandTransports() {
    const data = await this.getData('siturin.transporte_terrestres');

    const table = await this.landTransportRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});
    const catalogues = await this.catalogueRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.landTransportRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        entity.plate = item.placa;
        entity.registration = item.matricula;
        entity.registrationAt = item.fecha_matricula;
        entity.registrationExpirationAt = item.fecha_caducidad_matricula;
        entity.capacity = item.capacidad;

        const process = processes.find((x) => x.idTemp == item.tramite_id);
        const type = catalogues.find((x) => x.idTemp == item.tipo_id);

        if (process) entity.processId = process.id;
        if (type) entity.typeId = type.id;

        await this.landTransportRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateModelCatalogues() {
    const data = await this.getData('siturin.catalogo_modelo');

    const table = await this.modelCatalogueRepository.find({withDeleted:true});
    const classifications = await this.classificationRepository.find({withDeleted:true});
    const catalogues = await this.catalogueRepository.find({withDeleted:true});

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.modelCatalogueRepository.create();

        entity.createdAt = item.created_at || new Date();
        entity.updatedAt = item.updated_at || new Date();
        entity.deletedAt = item.deleted_at;
        entity.idTemp = item.id;

        const model = classifications.find((x) => x.idTemp == item.modelo_id);
        const catalogue = catalogues.find((x) => x.idTemp == item.catalogo_id);

        if (model) entity.modelId = model.id;
        if (catalogue) entity.catalogueId = catalogue.id;

        await this.modelCatalogueRepository.save(entity);
      }
    }

    return { data: null };
  }

  async migrateRegulations() {
    const data = await this.dataSource.query(`
      SELECT *
      FROM siturin.normativas
      WHERE es_visible = true
      ORDER BY modelo_type,modelo_id ,orden
    `);

    const regulationSectionTable = await this.regulationSectionRepository.find({withDeleted:true});
    const regulationItemTable = await this.regulationItemRepository.find({withDeleted:true});
    const classifications = await this.classificationRepository.find({withDeleted:true});
    const categories = await this.categoryRepository.find({withDeleted:true});
    const catalogues = await this.catalogueRepository.find({withDeleted:true});

    let currentSection: RegulationSectionEntity;

    for (const item of data) {
      if (!item.es_pregunta) {
        const exists = regulationSectionTable.find((register) => register.idTemp == item.id);

        if (!exists) {
          let newRegulationSection = this.regulationSectionRepository.create();

          newRegulationSection.createdAt = item.created_at || new Date();
          newRegulationSection.updatedAt = item.updated_at || new Date();
          newRegulationSection.enabled = item.es_visible;
          newRegulationSection.idTemp = item.id;
          newRegulationSection.isAdventureRequirement = item.es_requisito_aventura;
          newRegulationSection.isProtectedArea = item.es_area_protegida;
          newRegulationSection.minimumItems = item.minimo_preguntas;
          newRegulationSection.validationType = null;
          newRegulationSection.name = item.nombre;
          newRegulationSection.sort = item.orden;

          let model: ClassificationEntity | CategoryEntity | CatalogueEntity | undefined =
            undefined;

          switch (item.modelo_type) {
            case 'App\\Models\\Siturin\\Catalogo':
              model = catalogues.find((x) => {
                return x.idTemp == item.modelo_id;
              });
              break;

            case 'App\\Models\\Siturin\\Categoria':
              model = categories.find((x) => x.idTemp == item.modelo_id);
              break;

            case 'App\\Models\\Siturin\\Clasificacion':
              model = classifications.find((x) => x.idTemp == item.modelo_id);
              break;
          }

          if (model) newRegulationSection.modelId = model.id;

          currentSection = await this.regulationSectionRepository.save(newRegulationSection);
        }
      }

      if (item.es_pregunta) {
        const exists = regulationItemTable.find((register) => register.idTemp == item.id);

        if (!exists) {
          let newItemRegulation = this.regulationItemRepository.create();

          newItemRegulation.createdAt = item.created_at || new Date();
          newItemRegulation.updatedAt = item.updated_at || new Date();
          newItemRegulation.enabled = item.es_visible;
          newItemRegulation.idTemp = item.id;
          newItemRegulation.name = item.nombre;
          newItemRegulation.regulationSection = currentSection!;
          newItemRegulation.regulationSectionId = currentSection!.id;
          newItemRegulation.required = item.es_obligatorio;
          newItemRegulation.score = item.puntaje;
          newItemRegulation.sort = item.orden;

          await this.regulationItemRepository.save(newItemRegulation);
        }
      }
    }

    await this.updateSectionsValidationType();

    return { data: null };
  }

  async updateTypeCatalogues() {
    const catalogueTypes = [
      { type: 'transports_airline_type', tipo: 'aerolinea_tipos' },
      { type: 'inspections_state', tipo: 'inspeccion_estados' },
      { type: 'processes_state', tipo: 'tramite_estados' },
      { type: 'dpa_types', tipo: 'dpa_tipos' },
      { type: 'activities_geographic_area', tipo: 'zonas_geograficas' },
      { type: 'ctc_activities', tipo: 'actividades_turisticas' },
      {
        type: 'tourist_transport_companies_type',
        tipo: 'transporte_tipo_vehiculos',
      },
      {
        type: 'adventure_tourism_modalities',
        tipo: 'modalidades_turismo_aventura',
      },
      {
        type: 'adventure_tourism_modality_items',
        tipo: 'modalidades_turismo_aventura_item',
      },
      {
        type: 'process_agency_permanent_physical_space',
        tipo: 'operacion_intermediacion_espacio_fisico_permanente',
      },
      { type: 'processes_establishment_type', tipo: 'tramite_tipos_locales' },
      {
        type: 'internal_inactivation_causes',
        tipo: 'causales_inactivacion_interno',
      },
      {
        type: 'external_inactivation_causes',
        tipo: 'causales_inactivacion',
      },
      { type: 'inactivation_cause_type', tipo: 'tipos_causa_inactivacion' },
      {
        type: 'complementary_services_model',
        tipo: 'servicio_complementario_clasificaciones',
      },
      { type: 'breach_causes', tipo: 'causales_incumplimiento' },
      {
        type: 'activities_type_establishments',
        tipo: 'tramite_tipos_establecimientos',
      },
      { type: 'rucs_types', tipo: 'ruc_tipos_contribuyentes' },
      { type: 'rucs_state', tipo: 'ruc_estados_contribuyentes' },
      { type: 'processes_type', tipo: 'tramite_tipos' },
      { type: 'establishments_state', tipo: 'establecimiento_estados' },
      { type: 'transports_type', tipo: 'transporte_tipos' },
      { type: 'transports_establishment_type', tipo: 'transporte_tipo_locales' },
      { type: 'rooms_room_type', tipo: '' },
      { type: 'dpa_zone', tipo: '' },
      { type: 'internal_zonal_users_zone', tipo: '' },
      { type: 'complementary_services_entity', tipo: '' },
      { type: 'process_food_drinks_establishment_type', tipo: '' },
      { type: 'transport_vehicle_types', tipo: '' },
      { type: 'process_transport_airline_type', tipo: '' },
      { type: 'service_types_continent', tipo: 'tramite_tipos_servicios_continente' },
      { type: 'kitchen_types_continent', tipo: 'tramite_tipos_cocinas_continente' },
      { type: 'service_types_galapagos', tipo: 'tramite_tipos_servicios_galapagos' },
      { type: 'kitchen_types_galapagos', tipo: 'tramite_tipos_cocinas_galapagos' },
    ];

    const catalogues = await this.catalogueRepository.find({
      where: { required: false },
      withDeleted: true,
    });

    for (const item of catalogues) {
      const exist = catalogueTypes.find((catalogueType) => catalogueType.tipo === item.type);

      console.log(item.type, '->', exist);

      if (exist) {
        item.type = exist.type;
        item.required = true;
        await this.catalogueRepository.save(item);
      }
    }

    return { data: null };
  }

  async migrateFiles() {
    // const data = await this.getData('core.files');
    const data = await this.dataSource.query(`
      SELECT *
      FROM core.files
    `);

    const table = await this.fileRepository.find({withDeleted:true});
    const processes = await this.processRepository.find({withDeleted:true});
    const cadastres = await this.cadastreRepository.find({withDeleted:true});

    const csvLogPath = join(process.cwd(), 'storage/migration', 'errores_migracion.csv');

    const header = 'ID_Registro,Ruta_Local,Error\n';
    fs.writeFileSync(csvLogPath, header, 'utf8');

    for (const item of data) {
      const exists = table.find((register) => register.idTemp == item.id);

      if (!exists) {
        const entity = this.fileRepository.create();
        let localPath = join(
          global.process.cwd(),
          'storage/migration',
          item?.directory,
          `${item.id}.pdf`,
        );

        if (!fs.existsSync(localPath)) {
          localPath = join(process.cwd(), 'storage/migration', item?.directory, `${item.id}.PDF`);
          if (!fs.existsSync(localPath)) {
            const id = item?.id ?? 'N/A';

            // Escapamos las comas por si acaso la ruta contiene alguna
            const row = `"${id}","${localPath}","Archivo no encontrado"\n`;

            fs.appendFileSync(csvLogPath, row);
            continue;
          }
        }

        // 3. Leer el archivo como Buffer o Stream
        const fileBuffer = fs.readFileSync(localPath);

        let folder = '';

        switch (item.directory) {
          case 'private/actas-notificacion-temporal/':
            folder = 'actas-notificacion-temporal';
            break;
          case 'private/actas-actualizacion/':
            folder = 'actas-actualizacion';
            break;
          case 'private/catastros/inactivacion-interno/':
            folder = 'actas-inactivacion';
            break;
          case 'private/actas-notificacion-definitiva/':
            folder = 'actas-notificacion-definitiva';
            break;
          case 'private/formularios-requisitos/':
            folder = 'check-list';
            break;
          default:
            folder = 'temp';
        }

        const fileName = `${Date.now()}.pdf`;
        const filePath = `${folder}/${format(new Date(item.created_at), 'yyyy/MM')}/${fileName}`;

        // await this.minioService.uploadFile({
        //   filePath,
        //   buffer: fileBuffer,
        //   size: fs.statSync(localPath).size,
        //   mimetype: 'application/pdf',
        // });

        await this.bucketService.uploadFile({
          filePath,
          buffer: fileBuffer,
          mimetype: 'application/pdf',
        });

        let model: any = undefined;

        if (item.fileable_type === 'App\\Models\\Siturin\\Tramite')
          model = processes.find((x) => x.idTemp == item.filelable_id);

        if (item.fileable_type === 'App\\Models\\Siturin\\Catastro')
          model = cadastres.find((x) => x.idTemp == item.filelable_id);

        if (model) entity.modelId = model.id;

        const payload = {
          idTemp: item.id,
          modelId: model?.id,
          userId: null,
          fileName,
          extension: '.pdf',
          originalName: `${item.name}.pdf`,
          path: filePath,
          size: fs.statSync(localPath).size,
          typeId: null,
          mimeType: 'application/pdf',
        };

        await this.fileRepository.save(payload);
      }
    }

    return { data: null };
  }

  async migrateGuideActivity(file: Express.Multer.File) {
    const catalogues = await this.catalogueRepository.find({withDeleted:true});

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    //const sheetName = workbook.SheetNames[1];
    const dataExcel: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['act_cla_cat']);

    for (const data of dataExcel) {
      if (data['type'] == 'activity') {
        const zona = catalogues.find((x) => x.code == data['foreignkey']);
        const activity = this.activityRepository.create({
          code: data['code'],
          name: data['name'],
          sort: data['sort'],
          geographicAreaId: zona?.id,
        });
        await this.activityRepository.save(activity);
      }

      if (data['type'] == 'classification') {
        const activity = await this.activityRepository.findOne({
          where: { code: data['foreignkey'] },
        });
        const classification = this.classificationRepository.create({
          code: data['code'],
          name: data['name'],
          sort: data['sort'],
          acronym: data['acronym'],
          hasRegulation: true,
          isComplementaryService: false,
          hasCategorization: false,
          activityId: activity?.id,
        });
        await this.classificationRepository.save(classification);
      }

      if (data['type'] == 'category') {
        const classification = await this.classificationRepository.findOne({
          where: { code: data['foreignkey'] },
        });
        const category = this.categoryRepository.create({
          code: data['code'],
          name: data['name'],
          sort: data['sort'],
          hasRegulation: false,
          classificationId: classification?.id,
        });
        await this.categoryRepository.save(category);
      }
    }
    return null;
  }

  async migrateExcelModalCatalogue(file: Express.Multer.File) {
    const catalogues = await this.catalogueRepository.find({ withDeleted: true });
    const allDpa = await this.dpaRepository.find({ withDeleted: true });
    const classifications = await this.classificationRepository.find({ withDeleted: true });

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    //const sheetName = workbook.SheetNames[2];
    const dataExcel: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['model_catalogues']);

    for (const data of dataExcel) {
      if (data['type'] == 'protected_areas_name') {
        const catalogue = catalogues.find(
          (x) => x.code == data['code_catalogue'] && x.type == data['type'],
        );
        const dpa = allDpa.find((x) => x.code == data['code_model']);
        const modelCatalogue = this.modelCatalogueRepository.create({
          catalogueId: catalogue?.id,
          modelId: dpa?.id,
        });
        await this.modelCatalogueRepository.save(modelCatalogue);
      }

      if (data['type'] == 'adventure_tourism_modalities_name') {
        const catalogue = catalogues.find(
          (x) => x.code == data['code_catalogue'] && x.type == data['type'],
        );
        const model = classifications.find((x) => x.code == data['code_model']);
        const modelCatalogue = this.modelCatalogueRepository.create({
          catalogueId: catalogue?.id,
          modelId: model?.id,
        });
        await this.modelCatalogueRepository.save(modelCatalogue);
      }

      if (data['type'] == 'adventure_modalities_certificate') {
        const catalogue = catalogues.find(
          (x) => x.code == data['code_catalogue'] && x.type == data['type'],
        );
        const model = catalogues.find(
          (x) => x.code == data['code_model'] && x.type == 'adventure_tourism_modalities_name',
        );
        const modelCatalogue = this.modelCatalogueRepository.create({
          catalogueId: catalogue?.id,
          modelId: model?.id,
        });
        await this.modelCatalogueRepository.save(modelCatalogue);
      }
    }
    return null;
  }

  async migrateExcelRequirementConfiguration(file: Express.Multer.File) {
    const requirements = await this.catalogueRepository.find({ withDeleted: true });
    const guideTitles = await this.catalogueRepository.find({ withDeleted: true });
    const classifications = await this.classificationRepository.find({ withDeleted: true });

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    //const sheetName = workbook.SheetNames[3];
    const dataExcel: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['requirement']);

    for (const data of dataExcel) {
      const requirement = requirements.find(
        (x) => x.code == data['code_requirement'] && x.type == data['type_requirement'],
      );

      const guideTitle = guideTitles.find((x) => x.code == data['code_title']);
      const classification = classifications.find((x) => x.code == data['code_classification']);
      const requirementConfiguration = this.requirementConfigurationRepository.create({
        classificationId: classification?.id,
        requirementId: requirement?.id,
        professionalTypeCode: guideTitle?.code,
        professionalTypeName: guideTitle?.name,
        sortRegister: data['sort_register'],
        enabledRegister: data['enabled_register'],
        requiredRegister: data['required_register'],
        sortRenovation: data['sort_renovation'],
        enabledRenovation: data['enabled_renovation'],
        requiredRenovation: data['required_renovation'],
        sortCurrentCredential: data['sort_current_credential'],
        enabledCurrentCredential: data['enabled_current_credential'],
        requiredCurrentCredential: data['required_current_credential'],
        sortExpiredCredential: data['sort_expired_credential'],
        enabledExpiredCredential: data['enabled_expired_credential'],
        requiredExpiredCredential: data['required_expired_credential'],
      });
      await this.requirementConfigurationRepository.save(requirementConfiguration);
    }
    return null;
  }

  private async migratePersoneriaJuridicas() {
    const data = await this.getData('siturin.personeria_juridicas');

    for (const item of data) {
      const entity = this.catalogueRepository.create();
      entity.createdAt = item.created_at || new Date();
      entity.updatedAt = item.updated_at || new Date();
      entity.deletedAt = item.deleted_at;
      entity.enabled = item.es_visible;

      entity.idTemp = item.id;
      entity.code = item.codigo;
      entity.name = item.nombre;
      entity.type = 'processes_legal_entity';
      entity.acronym = item.codigo;
      entity.required = true;

      await this.catalogueRepository.save(entity);
    }

    return { data: null };
  }

  private async migrateCatastroEstados() {
    const data = await this.getData('siturin.catastro_estados');

    for (const item of data) {
      const entity = this.catalogueRepository.create();
      entity.createdAt = item.created_at || new Date();
      entity.updatedAt = item.updated_at || new Date();
      entity.deletedAt = item.deleted_at;
      entity.enabled = item.es_visible;

      entity.idTemp = item.id;
      entity.code = item.codigo;
      entity.name = item.nombre;
      entity.description = item.descripcion;
      entity.type = 'cadastre_states_state';
      entity.acronym = item.codigo;
      entity.required = true;

      await this.catalogueRepository.save(entity);
    }

    return { data: null };
  }

  private async updateSectionsValidationType() {
    const sections = await this.regulationSectionRepository.find({
      relations: { items: true },
    });

    for (const section of sections) {
      const items = section.items || [];
      if (items.length === 0) continue;
      const hasScore = items.some((item) => item.score);
      const hasRequired = items.some((item) => item.required);
      const hasNotRequired = items.some((item) => !item.required);

      if (hasScore) {
        section.validationType = 'SCORE_BASED';
      } else if (hasRequired && hasNotRequired) {
        section.validationType = 'MINIMUM_ITEMS';
      } else if (hasRequired && !hasNotRequired) {
        section.validationType = 'REQUIRED_ITEMS';
      }
      await this.regulationSectionRepository.save(section);
    }

    return { data: null };
  }

  private async updateActivityCodes() {
    const translationMap: Record<string, string> = {
      alimentos_bebidas_continente: 'food_drink_continent',
      alimentos_bebidas_galapagos: 'food_drink_galapagos',
      alojamiento_continente: 'accommodation_continent',
      alojamiento_galapagos: 'accommodation_galapagos',
      ctc_continente: 'ctc_continent',
      ctc_galapagos: 'ctc_galapagos',
      eventos_continente: 'event_continent',
      eventos_galapagos: 'event_galapagos',
      operacion_intermediacion_continente: 'agency_continent',
      operacion_intermediacion_galapagos: 'agency_galapagos',
      parques_continente: 'park_continent',
      parques_galapagos: 'park_galapagos',
      transporte_continente: 'transport_continent',
      transporte_galapagos: 'transport_galapagos',
    };

    const classifications = await this.classificationRepository.find();

    for (const classification of classifications) {
      const currentCode = classification.code;
      const translatedCode = translationMap[currentCode];

      if (translatedCode) {
        classification.code = translatedCode;
        await this.classificationRepository.save(classification);
      } else {
        console.log(`No translation found for code: ${currentCode}`);
      }
    }

    return { data: null };
  }

  private async updateClassificationCodes() {
    const translationMap: Record<string, string> = {
      establecimiento_movil: 'mobile_establishment',
      plazas_comida: 'food_courts',
      servicio_catering: 'catering_service',
      refugio: 'shelter',
      casa_huespedes: 'guest_house',
      agencia_viajes_dual: 'dual_travel_agency',
      agencia_viajes_internacional: 'international_travel_agency',
      agencia_viajes_mayorista: 'wholesale_travel_agency',
      cafeteria: 'cafeteria',
      bar: 'bar',
      discoteca: 'nightclub',
      hostal: 'hostel',
      ctc: 'ctc',
      campamento_turistico: 'tourist_camp',
      aereo: 'air_transport',
      maritimo: 'maritime_transport',
      terrestre: 'land_transport',
      inmuebles_habitacionales: 'residential_properties',
      hotel: 'hotel',
      resort: 'resort',
      restaurante: 'restaurant',
      hacienda_turistica: 'tourist_ranch',
      lodge: 'lodge',
      hosteria: 'inn',
      parques: 'parks',
      boleras: 'bowling_alleys',
      pistas: 'tracks',
      termas: 'hot_springs',
      balnearios: 'spas',
      centros: 'centers',
      eventos: 'events',
      convenciones: 'conventions',
      salas: 'rooms',
      operador_turistico: 'tour_operator',
    };

    const classifications = await this.classificationRepository.find();

    for (const classification of classifications) {
      const currentCode = classification.code;
      const translatedCode = translationMap[currentCode];

      if (translatedCode) {
        classification.code = translatedCode;
        await this.classificationRepository.save(classification);
      } else {
        console.log(`No translation found for code: ${currentCode}`);
      }
    }

    return { data: null };
  }

  async migrateExcelParish(file: Express.Multer.File) {
    const catalogues = await this.catalogueRepository.find();
    const allDpa = await this.dpaRepository.find();

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    //const sheetName = workbook.SheetNames[0];
    const dataExcel: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['parish']);

    const dpaTypeParish = catalogues.find((x) => x.type === 'dpa_types' && x.code === 'parish');
    if (!dpaTypeParish) {
      throw new NotFoundException('No hay tipo de DPA para parroquia');
    }

    for (const data of dataExcel) {
      const canton = allDpa.find((x) => x.code === data['codigo'].toString().substring(0, 4));

      if (!canton) {
        throw new NotFoundException('No hay tipo de DPA para el codigo');
      }

      const modelDpa = this.dpaRepository.create({
        parentId: canton.id,
        typeId: dpaTypeParish.id,
        code: data['codigo'],
        name: data['descripcion'],
      });
      await this.dpaRepository.save(modelDpa);
    }
    return null;
  }

  compareWords(wordOne: unknown, wordTwo: unknown): boolean {
    const normalizer = (text: unknown): string => {
      if (text === null || text === undefined) {
        return '';
      }

      return String(text)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    };

    return normalizer(wordOne) === normalizer(wordTwo);
  }

  async migrateGuideGobEcBck(file: Express.Multer.File) {
    const catalogues = await this.catalogueRepository.find();
    const dpa = await this.dpaRepository.find();
    const users = await this.userRepository.find();
    const activities = await this.activityRepository.find();
    const classifications = await this.classificationRepository.find();
    const categories = await this.categoryRepository.find();

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; //review
    const dataExcel: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const stateRuc = catalogues.find((x) => x.type === 'rucs_state' && x.code === 'activo');
    const stateEstablishment = catalogues.find(
      (x) => x.type === 'establishments_state' && x.code === 'abierto',
    );
    const dpaTypeProvince = catalogues.find((x) => x.type === 'dpa_types' && x.code === 'province');
    const dpaTypeCanton = catalogues.find((x) => x.type === 'dpa_types' && x.code === 'canton');
    const dpaTypeParish = catalogues.find((x) => x.type === 'dpa_types' && x.code === 'parish');
    const identificationType = catalogues.find(
      (x) => x.type === 'users_identification_type' && x.code === '2',
    );
    const stateExpired = catalogues.find(
      (item) =>
        item.code == CatalogueCredentialsStateEnum.expired &&
        item.type == CoreCatalogueTypeEnum.credentials_state,
    );

    const stateCurrent = catalogues.find(
      (item) =>
        item.code == CatalogueCredentialsStateEnum.current &&
        item.type == CoreCatalogueTypeEnum.credentials_state,
    );

    const typeProcess = catalogues.find(
      (item) =>
        item.code == CatalogueProcessesTypeEnum.registration &&
        item.type == CoreCatalogueTypeEnum.processes_type,
    );

    const stateProcess = catalogues.find(
      (item) =>
        item.code == CatalogueProcessesStateEnum.completed &&
        item.type == CoreCatalogueTypeEnum.processes_state,
    );

    const stateCadastre = catalogues.find(
      (item) =>
        item.code == CatalogueCadastresStateEnum.ratified &&
        item.type == CoreCatalogueTypeEnum.cadastre_states_state,
    );

    const geographicArea = catalogues.find((item) => item.code == 'continent');

    const guide = activities.find(
      (item) => item.code == CatalogueActivitiesCodeEnum.guide_continent,
    );

    if (!typeProcess || !stateProcess || !stateCadastre || !guide || !geographicArea) {
      throw new NotFoundException(
        'No hay estado del proceso o catastro o no hay typo de tramite o la actividad guianza, o area geografica continente',
      );
    }

    if (!stateRuc || !stateEstablishment) {
      throw new NotFoundException(
        'No hay estado ruc activo o estado estblecimiento estado abierto',
      );
    }
    if (!identificationType) {
      throw new NotFoundException('No hay tipo identificación ruc');
    }
    if (!dpaTypeProvince || !dpaTypeCanton || !dpaTypeParish) {
      throw new NotFoundException('No hay tipo de DPA para provincia, canton o parroquia');
    }
    await this.dataSourceV3.transaction(async (manager) => {
      let i = 0;
      for (const data of dataExcel) {
        i++;
        console.log('fila: ', i);
        const userRepository = manager.getRepository(UserEntity);
        const rucRepository = manager.getRepository(RucEntity);
        const establishmentRepository = manager.getRepository(EstablishmentEntity);
        const processRepository = manager.getRepository(ProcessEntity);
        const languageRepository = manager.getRepository(LanguageEntity);
        const adventureModalityRepository = manager.getRepository(AdventureModalityEntity);
        const protectedAreaRepository = manager.getRepository(ProtectedAreaEntity);
        const credentialRepository = manager.getRepository(CredentialEntity);
        const cadastreRepository = manager.getRepository(CadastreEntity);
        const cadastreStateRepository = manager.getRepository(CadastreStateEntity);

        const user = users.find((x) => x.ruc == data['ruc']);
        if (user) {
          throw new NotFoundException({
            error: 'Usuario ya existe',
            message: 'El usuario con ruc' + user.ruc + 'ya existe',
          });
        }

        //Crear user
        const newUser = userRepository.create();

        const cedula = data['ruc'].substring(0, 10);
        const url = `${this.configService.externalApis.urlDinardap}/registro-civil/${cedula}`;
        const response = await firstValueFrom(this.httpService.get(url));
        const rc = response.data.data;

        const nationality = catalogues.find(
          (item) => item.name?.trim().toLowerCase() === rc.nacionalidad?.trim().toLowerCase(),
        );
        if (nationality?.id) newUser.nationality = nationality;

        const sex = catalogues.find(
          (item) => item.name?.trim().toLowerCase() === rc.sexo?.trim().toLowerCase(),
        );
        if (sex?.id) newUser.sex = sex;

        const [day, month, year] = rc.fechaNacimiento.split('/').map(Number);
        newUser.birthdate = new Date(year, month - 1, day);
        newUser.identificationTypeId = identificationType.id;
        newUser.email = data['email'];
        newUser.emailVerifiedAt = new Date();
        newUser.identification = data['ruc'];
        newUser.name = data['razon_social'];
        newUser.password = data['ruc'];
        newUser.passwordChanged = false;
        newUser.username = data['email'];
        if (
          data['total_mujeres_discapacidad'] === '1' ||
          data['total_hombres_discapacidad'] === '1'
        )
          newUser.hasDisability = true;
        const userSave = await userRepository.save(newUser);

        //Crear ruc
        const newRuc = rucRepository.create();

        newRuc.stateId = stateRuc.id;
        newRuc.number = data['ruc'];
        newRuc.legalName = data['razon_social'];
        const rucSave = await rucRepository.save(newRuc);

        //Crear establishment
        const newEstablishment = establishmentRepository.create();

        console.log(data['provincia']);
        const province = dpa.find(
          (x) => this.compareWords(x.name, data['provincia']) && x.typeId === dpaTypeProvince.id,
        );
        console.log(province);

        const canton = dpa.find(
          (x) => this.compareWords(x.name, data['canton']) && x.typeId === dpaTypeCanton.id,
        );

        const parish = dpa.find(
          (x) => this.compareWords(x.name, data['parroquia']) && x.typeId === dpaTypeParish.id,
        );

        if (!province || !canton || !parish) {
          throw new NotFoundException({
            error: 'No se encontro la provincia, el canton o la parroquia',
            message: `${province} ${canton} ${parish}`,
          });
        }

        newEstablishment.rucId = rucSave.id;
        newEstablishment.stateId = stateEstablishment.id;
        newEstablishment.provinceId = province.id;
        newEstablishment.cantonId = canton.id;
        newEstablishment.parishId = parish.id;
        newEstablishment.number = data['numero_establecimiento'];
        newEstablishment.mainStreet = data['calle_principal'];
        newEstablishment.numberStreet = data['numero_casa'];
        newEstablishment.secondaryStreet = data['calle_secundaria'];
        newEstablishment.referenceStreet = data['referencia'];
        newEstablishment.latitude = data['latitud'];
        newEstablishment.longitude = data['longitud'];
        newEstablishment.isCadastre = true;

        const establishmentSave = await establishmentRepository.save(newEstablishment);

        //Crear Process
        const newProcess = processRepository.create();

        newProcess.activityId = guide.id;
        newProcess.establishmentId = establishmentSave.id;
        newProcess.typeId = typeProcess.id;
        newProcess.stateId = stateProcess.id;
        newProcess.registeredAt = new Date();
        newProcess.startedAt = new Date();
        newProcess.endedAt = new Date();
        if (userSave.sex?.code === CatalogueUsersSexEnum.female) {
          newProcess.totalWomen = 1;
          if (userSave.hasDisability) newProcess.totalWomenDisability = 1;
        } else {
          newProcess.totalMen = 1;
          if (userSave.hasDisability) newProcess.totalMenDisability = 1;
        }
        const processSave = await processRepository.save(newProcess);

        //Crear Languaje
        const languajes = data['idiomas'] ? data['idiomas'].split(',').map((x) => x.trim()) : [];

        for (const languaje of languajes) {
          const result = catalogues.find(
            (item) =>
              item.name?.trim().toLowerCase() === languaje?.trim().toLowerCase() &&
              item.type === 'guide_languages_name',
          );
          if (result) {
            const newLanguaje = languageRepository.create();
            newLanguaje.establishmentId = establishmentSave.id;
            newLanguaje.processId = processSave.id;
            newLanguaje.languageCode = result.code;
            newLanguaje.languageName = result.name;
            await languageRepository.save(newLanguaje);
          }
        }

        //Crear Adventure Modality
        const modalities = data['modalidades']
          ? data['modalidades'].split(',').map((x) => x.trim())
          : [];
        for (const modality of modalities) {
          const result = catalogues.find(
            (item) =>
              item.name?.trim().toLowerCase() === modality?.trim().toLowerCase() &&
              item.type === 'adventure_tourism_modalities_name',
          );
          if (result) {
            const newModality = adventureModalityRepository.create();
            newModality.establishmentId = establishmentSave.id;
            newModality.processId = processSave.id;
            newModality.modalityCode = result.code;
            newModality.modalityName = result.name;
            await adventureModalityRepository.save(newModality);
          }
        }

        //Crear Protected Area
        const areas = data['areas_protegidas']
          ? data['areas_protegidas'].split(',').map((x) => x.trim())
          : [];
        for (const area of areas) {
          const result = catalogues.find(
            (item) =>
              item.name?.trim().toLowerCase() === area?.trim().toLowerCase() &&
              item.type === 'protected_areas_name',
          );
          if (result) {
            const newProtectedArea = protectedAreaRepository.create();
            newProtectedArea.establishmentId = establishmentSave.id;
            newProtectedArea.processId = processSave.id;
            newProtectedArea.areaCode = result.code;
            newProtectedArea.areaName = result.name;
            await protectedAreaRepository.save(newProtectedArea);
          }
        }

        //Crear credential
        const clasificationList = data['clasificacion'].split(',').map((x) => x.trim());
        const initDates = String(data['fecha_inicio'])
          .split(',')
          .map((x) => x.trim());
        const endDates = String(data['fecha_fin'])
          .split(',')
          .map((x) => x.trim());

        if (
          clasificationList.length !== initDates.length ||
          clasificationList.length !== endDates.length
        ) {
          throw new NotFoundException(
            'La cantidad de clasificaciones, fechas de inicio y fechas de fin debe coincidir.',
          );
        }

        for (let i = 0; i < clasificationList.length; i++) {
          const clasification = clasificationList[i];
          const initDate = initDates[i];
          const endDate = new Date(endDates[i]);

          endDate.setHours(0, 0, 0, 0);

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const result = classifications.find(
            (item) => item.name?.trim().toLowerCase() === clasification?.trim().toLowerCase(),
          );
          if (result) {
            const newCredential = credentialRepository.create();
            const category = categories.find((item) => item.classificationId === result.id);
            if (!category) {
              throw new NotFoundException('No esxite la categoria para' + result.name);
            }
            newCredential.establishmentId = establishmentSave.id;
            newCredential.processId = processSave.id;
            newCredential.classificationId = result.id;
            newCredential.categoryId = category?.id;
            newCredential.startedAt = new Date(initDate);
            newCredential.endedAt = new Date(endDate);
            newCredential.origin = data['origen'];
            newCredential.geographicAreaId = geographicArea.id;
            const state = endDate >= today ? stateCurrent : stateExpired;
            if (state) {
              newCredential.stateCode = state.code;
              newCredential.stateName = state.name;
            }

            await credentialRepository.save(newCredential);
          }
        }

        //Crear Cadastre
        const newCadastre = cadastreRepository.create();
        newCadastre.processId = processSave.id;
        newCadastre.registerNumber = data['numero_registro'];
        newCadastre.registeredAt = new Date(data['fecha_registro']);
        newCadastre.systemOrigin = data['origen'];
        newCadastre.stateId = stateCadastre.id;

        const cadastreSave = await cadastreRepository.save(newCadastre);

        //Crear Cadastre State
        const newCadastreState = cadastreStateRepository.create();
        newCadastreState.cadastreId = cadastreSave.id;
        newCadastreState.stateId = stateCadastre.id;
        newCadastreState.isCurrent = true;

        await cadastreStateRepository.save(newCadastreState);
      }
    });
    return null;
  }

  // --------------------------------------------------
  // MÉTODO AUXILIAR
  // --------------------------------------------------
  private normalizeText(value: any): string {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  async migrateGuideGobEc(file: Express.Multer.File) {
    // ============================================================
    // CONFIGURACIÓN
    // ============================================================

    const CONCURRENCY = 5;
    const DINARDAP_TIMEOUT = 10000; // 10 segundos
    const DINARDAP_RETRIES = 2;

    // ============================================================
    // CARGAR CATÁLOGOS
    // ============================================================

    const [catalogues, dpa, users, activities, classifications, categories] = await Promise.all([
      this.catalogueRepository.find(),
      this.dpaRepository.find(),
      this.userRepository.find(),
      this.activityRepository.find(),
      this.classificationRepository.find(),
      this.categoryRepository.find(),
    ]);

    // ============================================================
    // LEER EXCEL
    // ============================================================

    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
    });

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new NotFoundException('El archivo Excel no contiene hojas.');
    }

    const dataExcel: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!dataExcel.length) {
      throw new NotFoundException('El archivo Excel no contiene registros.');
    }

    // ============================================================
    // CATÁLOGOS PRINCIPALES
    // ============================================================

    const stateRuc = catalogues.find((x) => x.type === 'rucs_state' && x.code === 'activo');

    const stateEstablishment = catalogues.find(
      (x) => x.type === 'establishments_state' && x.code === 'abierto',
    );

    const dpaTypeProvince = catalogues.find((x) => x.type === 'dpa_types' && x.code === 'province');

    const dpaTypeCanton = catalogues.find((x) => x.type === 'dpa_types' && x.code === 'canton');

    const dpaTypeParish = catalogues.find((x) => x.type === 'dpa_types' && x.code === 'parish');

    const identificationType = catalogues.find(
      (x) => x.type === 'users_identification_type' && x.code === '2',
    );

    const typeRuc = catalogues.find(
      (item) =>
        item.code === CatalogueRucTypeEnum.natural &&
        item.type === CoreCatalogueTypeEnum.rucs_types,
    );

    const stateExpired = catalogues.find(
      (item) =>
        item.code === CatalogueCredentialsStateEnum.expired &&
        item.type === CoreCatalogueTypeEnum.credentials_state,
    );

    const stateCurrent = catalogues.find(
      (item) =>
        item.code === CatalogueCredentialsStateEnum.current &&
        item.type === CoreCatalogueTypeEnum.credentials_state,
    );

    const typeProcess = catalogues.find(
      (item) =>
        item.code === CatalogueProcessesTypeEnum.registration &&
        item.type === CoreCatalogueTypeEnum.processes_type,
    );

    const stateProcess = catalogues.find(
      (item) =>
        item.code === CatalogueProcessesStateEnum.completed &&
        item.type === CoreCatalogueTypeEnum.processes_state,
    );

    const stateCadastre = catalogues.find(
      (item) =>
        item.code === CatalogueCadastresStateEnum.ratified &&
        item.type === CoreCatalogueTypeEnum.cadastre_states_state,
    );

    const geographicArea = catalogues.find((item) => item.code === 'continent');

    const guide = activities.find(
      (item) => item.code === CatalogueActivitiesCodeEnum.guide_continent,
    );

    // ============================================================
    // VALIDACIONES
    // ============================================================

    if (!typeProcess || !stateProcess || !stateCadastre || !guide || !geographicArea || !typeRuc) {
      throw new Error(
        `No se encontró los siguiente ` +
        `Tipo Proceso: ${typeProcess}, ` +
        `Estado proceso: ${stateProcess}, ` +
        `Estado catastro: ${stateCadastre}, ` +
        `Guide: ${guide}, ` +
        `typeRuc: ${typeRuc}, ` +
        `geographicArea: ${geographicArea}`,
      );
    }

    if (!stateRuc || !stateEstablishment) {
      throw new NotFoundException('No hay estado RUC activo o estado establecimiento abierto.');
    }

    if (!identificationType) {
      throw new NotFoundException('No hay tipo identificación RUC.');
    }

    if (!dpaTypeProvince || !dpaTypeCanton || !dpaTypeParish) {
      throw new NotFoundException('No hay tipo de DPA para provincia, cantón o parroquia.');
    }

    // ============================================================
    // MAPAS DE CATÁLOGOS
    // Evita hacer .find() constantemente durante 1500 registros
    // ============================================================

    const catalogueByTypeAndName = new Map<string, any>();

    for (const catalogue of catalogues) {
      if (!catalogue.name || !catalogue.type) {
        continue;
      }

      const key = `${catalogue.type}|${this.normalizeText(catalogue.name)}`;

      catalogueByTypeAndName.set(key, catalogue);
    }

    const classificationMap = new Map<string, any>();

    for (const classification of classifications) {
      if (classification.name) {
        classificationMap.set(this.normalizeText(classification.name), classification);
      }
    }

    const categoryMap = new Map<string, any>();

    for (const category of categories) {
      if (category.classificationId) {
        categoryMap.set(category.classificationId, category);
      }
    }

    // ============================================================
    // VALIDAR DUPLICADOS DEL EXCEL
    // ============================================================

    const excelRucs = new Set<string>();
    const duplicateRucs = new Set<string>();

    for (const data of dataExcel) {
      const ruc = String(data['ruc'] ?? '').trim();

      if (!ruc) {
        continue;
      }

      if (excelRucs.has(ruc)) {
        duplicateRucs.add(ruc);
      }

      excelRucs.add(ruc);
    }

    if (duplicateRucs.size > 0) {
      throw new NotFoundException({
        error: 'RUC duplicados en el Excel',
        rucs: Array.from(duplicateRucs),
      });
    }

    // ============================================================
    // RUC YA EXISTENTES EN BD
    // ============================================================

    const existingRucs = new Set(
      users.filter((user) => user.ruc).map((user) => String(user.ruc).trim()),
    );

    // ============================================================
    // RESULTADOS
    // ============================================================

    const resultados: any[] = [];
    const errores: any[] = [];

    // ============================================================
    // CONSULTAR DINARDAP POR LOTES
    //
    // Máximo 5 llamadas simultáneas
    // Timeout: 10 segundos
    // Reintentos: 2
    // ============================================================

    const registrosConRC: any[] = [];

    for (let inicio = 0; inicio < dataExcel.length; inicio += CONCURRENCY) {
      const batch = dataExcel.slice(inicio, inicio + CONCURRENCY);

      console.log(
        `Consultando DINARDAP: registros ${inicio + 1} - ${Math.min(
          inicio + CONCURRENCY,
          dataExcel.length,
        )} de ${dataExcel.length}`,
      );

      const batchResults = await Promise.all(
        batch.map(async (data, index) => {
          const fila = inicio + index + 2;

          const ruc = String(data['ruc'] ?? '').trim();

          try {
            // --------------------------------------------
            // Validar RUC
            // --------------------------------------------

            if (!ruc) {
              throw new Error('El registro no contiene RUC.');
            }

            // --------------------------------------------
            // Validar si ya existe
            // --------------------------------------------

            if (existingRucs.has(ruc)) {
              throw new Error(`El usuario con RUC ${ruc} ya existe.`);
            }

            // --------------------------------------------
            // Validar longitud
            // --------------------------------------------

            if (!/^\d{13}$/.test(ruc)) {
              throw new Error(
                `El RUC ${ruc} no tiene una longitud o formato válido. Debe contener exactamente 13 dígitos.`,
              );
            }

            const cedula = ruc.substring(0, 10);

            const url =
              `${this.configService.externalApis.urlDinardap}` + `/registro-civil/${cedula}`;

            console.log(`Fila ${fila}: consultando DINARDAP ${cedula}`);

            // --------------------------------------------
            // LLAMADA DINARDAP
            // --------------------------------------------

            const response = await firstValueFrom(
              this.httpService.get(url).pipe(
                timeout(DINARDAP_TIMEOUT),
                retry({
                  count: DINARDAP_RETRIES,
                  delay: (_error, retryCount) => timer(retryCount * 1000),
                }),
              ),
            );

            const rc = response?.data?.data;

            if (!rc) {
              throw new Error('DINARDAP no retornó información para la identificación.');
            }

            if (!rc.fechaNacimiento) {
              throw new Error('DINARDAP no retornó fecha de nacimiento.');
            }

            return {
              fila,
              data,
              rc,
            };
          } catch (error) {
            console.error(`Error DINARDAP - fila ${fila} - RUC ${ruc}`, error);

            errores.push({
              fila,
              ruc,
              etapa: 'DINARDAP',
              error: error?.message || 'Error consultando DINARDAP',
            });

            return null;
          }
        }),
      );

      registrosConRC.push(...batchResults.filter((item) => item !== null));
    }

    console.log(
      `Consultas DINARDAP finalizadas. ` +
      `Correctas: ${registrosConRC.length}. ` +
      `Errores: ${errores.length}.`,
    );

    // ============================================================
    // PROCESAR BASE DE DATOS
    //
    // Una transacción independiente por registro
    // ============================================================

    for (const registro of registrosConRC) {
      const { fila, data, rc } = registro;

      const ruc = String(data['ruc'] ?? '').trim();

      try {
        console.log(`Procesando BD fila ${fila}/${dataExcel.length} - RUC ${ruc}`);

        await this.dataSourceV3.transaction(async (manager) => {
          // ==================================================
          // REPOSITORIES
          // ==================================================

          const userRepository = manager.getRepository(UserEntity);

          const rucRepository = manager.getRepository(RucEntity);

          const establishmentRepository = manager.getRepository(EstablishmentEntity);

          const processRepository = manager.getRepository(ProcessEntity);

          const languageRepository = manager.getRepository(LanguageEntity);

          const adventureModalityRepository = manager.getRepository(AdventureModalityEntity);

          const protectedAreaRepository = manager.getRepository(ProtectedAreaEntity);

          const credentialRepository = manager.getRepository(CredentialEntity);

          const cadastreRepository = manager.getRepository(CadastreEntity);

          const cadastreStateRepository = manager.getRepository(CadastreStateEntity);

          // ==================================================
          // VALIDAR USUARIO / RUC / ESTABLECIMIENTO
          // ==================================================

          let userSave: UserEntity;
          let rucSave: RucEntity;

          const userExists = await userRepository.findOne({
            where: {
              identification: ruc,
            },
          });

          if (userExists) {
            userSave = userExists;

            //UPDATE CAMPOS NUEVOS
            const updateUser = userExists;

            const nationality = catalogueByTypeAndName.get(
              `users_nationality|${this.normalizeText(rc.nacionalidad)}`,
            );

            if (nationality?.id) {
              updateUser.nationality = nationality;
            }

            const sex = catalogueByTypeAndName.get(`users_sex|${this.normalizeText(rc.sexo)}`);

            if (sex?.id) {
              updateUser.sex = sex;
            }

            const [day, month, year] = String(rc.fechaNacimiento).split('/').map(Number);

            if (!day || !month || !year) {
              throw new Error(`Fecha de nacimiento inválida: ${rc.fechaNacimiento}`);
            }

            updateUser.birthdate = new Date(year, month - 1, day);
            updateUser.email = data['email'];
            updateUser.phone = data['telefono'];
            updateUser.username = data['email'];
            if (
              String(data['total_mujeres_discapacidad']) === '1' ||
              String(data['total_hombres_discapacidad']) === '1'
            ) {
              updateUser.hasDisability = true;
            } else {
              updateUser.hasDisability = false;
            }

            userSave = await userRepository.save(updateUser);

            // --------------------------------------------
            // BUSCAR RUC
            // --------------------------------------------

            const rucExists = await rucRepository.findOne({
              where: {
                number: ruc,
              },
            });

            if (rucExists) {
              rucSave = rucExists;

              // --------------------------------------------
              // BUSCAR ESTABLECIMIENTO
              // --------------------------------------------

              const numeroEstablecimientoExcel = String(
                Number(data['numero_establecimiento'] ?? 0),
              );

              const establishmentExists = await establishmentRepository.findOne({
                where: {
                  rucId: rucExists.id,
                  number: numeroEstablecimientoExcel,
                },
              });

              // --------------------------------------------
              // SOLO AQUÍ ES DUPLICADO
              // --------------------------------------------

              if (establishmentExists) {
                throw new Error(
                  `El usuario con RUC ${ruc} ya existe y ` +
                  `el establecimiento ${numeroEstablecimientoExcel} ` +
                  `ya está registrado.`,
                );
              }
            } else {
              // --------------------------------------------
              // EL USUARIO EXISTE PERO EL RUC NO
              // --------------------------------------------

              const newRuc = rucRepository.create();

              newRuc.stateId = stateRuc.id;
              newRuc.number = ruc;
              newRuc.legalName = data['razon_social'];
              newRuc.typeId = typeRuc.id;

              rucSave = await rucRepository.save(newRuc);
            }
          } else {
            // ==================================================
            // USUARIO NO EXISTE
            // CREAR USER
            // ==================================================

            const newUser = userRepository.create();

            const nationality = catalogueByTypeAndName.get(
              `users_nationality|${this.normalizeText(rc.nacionalidad)}`,
            );

            if (nationality?.id) {
              newUser.nationality = nationality;
            }

            const sex = catalogueByTypeAndName.get(`users_sex|${this.normalizeText(rc.sexo)}`);

            if (sex?.id) {
              newUser.sex = sex;
            }

            const [day, month, year] = String(rc.fechaNacimiento).split('/').map(Number);

            if (!day || !month || !year) {
              throw new Error(`Fecha de nacimiento inválida: ${rc.fechaNacimiento}`);
            }

            newUser.birthdate = new Date(year, month - 1, day);
            newUser.identificationTypeId = identificationType.id;
            newUser.email = data['email'];
            newUser.phone = data['telefono'];
            newUser.emailVerifiedAt = new Date();
            newUser.identification = ruc;
            newUser.name = data['razon_social'];
            newUser.password = ruc;
            newUser.passwordChanged = false;
            newUser.username = data['email'];

            if (
              String(data['total_mujeres_discapacidad']) === '1' ||
              String(data['total_hombres_discapacidad']) === '1'
            ) {
              newUser.hasDisability = true;
            } else {
              newUser.hasDisability = false;
            }

            userSave = await userRepository.save(newUser);

            // ==================================================
            // CREAR RUC
            // ==================================================

            const newRuc = rucRepository.create();

            newRuc.stateId = stateRuc.id;
            newRuc.number = ruc;
            newRuc.legalName = data['razon_social'];

            rucSave = await rucRepository.save(newRuc);
          }
          // ==================================================
          // UBICACIÓN
          // ==================================================

          const province = dpa.find(
            (x) => this.compareWords(x.name, data['provincia']) && x.typeId === dpaTypeProvince.id,
          );

          const canton = dpa.find(
            (x) => this.compareWords(x.name, data['canton']) && x.typeId === dpaTypeCanton.id,
          );

          const parish = dpa.find(
            (x) => this.compareWords(x.name, data['parroquia']) && x.typeId === dpaTypeParish.id,
          );

          if (!province || !canton || !parish) {
            throw new Error(
              `No se encontró la provincia, cantón o parroquia. ` +
              `Provincia: ${data['provincia']}, ` +
              `Cantón: ${data['canton']}, ` +
              `Parroquia: ${data['parroquia']}`,
            );
          }

          // ==================================================
          // CREAR ESTABLECIMIENTO
          // ==================================================

          const newEstablishment = establishmentRepository.create();

          newEstablishment.rucId = rucSave.id;
          newEstablishment.stateId = stateEstablishment.id;
          newEstablishment.provinceId = province.id;
          newEstablishment.cantonId = canton.id;
          newEstablishment.parishId = parish.id;
          newEstablishment.number = String(Number(data['numero_establecimiento']));
          newEstablishment.mainStreet = data['calle_principal'];
          newEstablishment.numberStreet = data['numero_casa'];
          newEstablishment.secondaryStreet = data['calle_secundaria'];
          newEstablishment.referenceStreet = data['referencia'];
          newEstablishment.latitude = data['latitud'];
          newEstablishment.longitude = data['longitud'];
          newEstablishment.email = data['email'];
          newEstablishment.phone = data['telefono'];
          newEstablishment.isCadastre = true;

          const establishmentSave = await establishmentRepository.save(newEstablishment);

          // ==================================================
          // CREAR PROCESS
          // ==================================================

          const newProcess = processRepository.create();

          newProcess.activityId = guide.id;

          newProcess.establishmentId = establishmentSave.id;

          newProcess.typeId = typeProcess.id;

          newProcess.stateId = stateProcess.id;

          newProcess.registeredAt = new Date();

          newProcess.startedAt = new Date();

          newProcess.endedAt = new Date();

          if (userSave.sex?.code === CatalogueUsersSexEnum.female) {
            newProcess.totalWomen = 1;

            if (userSave.hasDisability) {
              newProcess.totalWomenDisability = 1;
            }
          } else {
            newProcess.totalMen = 1;

            if (userSave.hasDisability) {
              newProcess.totalMenDisability = 1;
            }
          }

          const processSave = await processRepository.save(newProcess);

          // ==================================================
          // IDIOMAS
          // ==================================================

          const languajes = data['idiomas']
            ? String(data['idiomas'])
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean)
            : [];

          const levels = data['nivel_idioma']
            ? String(data['nivel_idioma'])
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean)
            : [];

          if (languajes.length !== levels.length) {
            throw new Error('La cantidad de idiomas y niveles debe coincidir.');
          }

          //for (const languaje of languajes) {
          for (let i = 0; i < languajes.length; i++) {
            const languaje = languajes[i];
            const resultLanguaje = catalogueByTypeAndName.get(
              `guide_languages_name|${this.normalizeText(languaje)}`,
            );

            if (!resultLanguaje) {
              continue;
            }

            const level = levels[i];
            const resultLevel = catalogueByTypeAndName.get(
              `guide_languages_level|${this.normalizeText(level)}`,
            );

            if (!resultLevel) {
              continue;
            }

            const newLanguaje = languageRepository.create();

            newLanguaje.establishmentId = establishmentSave.id;
            newLanguaje.processId = processSave.id;
            newLanguaje.languageCode = resultLanguaje.code;
            newLanguaje.languageName = resultLanguaje.name;
            newLanguaje.levelName = resultLevel.name;
            newLanguaje.levelCode = resultLevel.code;

            await languageRepository.save(newLanguaje);
          }

          // ==================================================
          // MODALIDADES
          // ==================================================

          const modalities = data['modalidades']
            ? String(data['modalidades'])
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean)
            : [];

          const cert = catalogueByTypeAndName.get(
            `adventure_modalities_certificate|${this.normalizeText('Otras certificadoras')}`,
          );

          for (const modality of modalities) {
            const result = catalogueByTypeAndName.get(
              `adventure_tourism_modalities_name|${this.normalizeText(modality)}`,
            );

            if (!result) {
              continue;
            }

            const newModality = adventureModalityRepository.create();

            newModality.establishmentId = establishmentSave.id;
            newModality.processId = processSave.id;
            newModality.modalityCode = result.code;
            newModality.modalityName = result.name;
            newModality.modalityCertificateName = cert.name;
            newModality.modalityCertificateCode = cert.code;

            await adventureModalityRepository.save(newModality);
          }

          // ==================================================
          // ÁREAS PROTEGIDAS
          // ==================================================

          const areas = data['areas_protegidas']
            ? String(data['areas_protegidas'])
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean)
            : [];

          for (const area of areas) {
            const result = catalogueByTypeAndName.get(
              `protected_areas_name|${this.normalizeText(area)}`,
            );
            const province = dpa.find(
              (x) => this.compareWords(x.name, data['provincia_areas_protegidas']) && x.typeId === dpaTypeProvince.id,
            );


            if (!result) {
              continue;
            }

            const newProtectedArea = protectedAreaRepository.create();

            newProtectedArea.establishmentId = establishmentSave.id;
            newProtectedArea.processId = processSave.id;
            newProtectedArea.areaCode = result.code;
            newProtectedArea.areaName = result.name;
            newProtectedArea.provinceId = province?.id ?? '';

            await protectedAreaRepository.save(newProtectedArea);
          }

          // ==================================================
          // CREDENCIALES
          // ==================================================

          const clasificationList = String(data['clasificacion'] ?? '')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean);

          const initDates = String(data['fecha_inicio'] ?? '')
            .split(',')
            .map((x) => x.trim());

          const endDates = String(data['fecha_fin'] ?? '')
            .split(',')
            .map((x) => x.trim());

          if (
            clasificationList.length !== initDates.length ||
            clasificationList.length !== endDates.length
          ) {
            throw new Error(
              'La cantidad de clasificaciones, fechas de inicio y fechas de fin debe coincidir.',
            );
          }

          for (let i = 0; i < clasificationList.length; i++) {
            const clasification = clasificationList[i];

            const initDate = initDates[i];

            const endDate = new Date(endDates[i]);

            endDate.setHours(0, 0, 0, 0);

            const today = new Date();

            today.setHours(0, 0, 0, 0);

            const classification = classificationMap.get(this.normalizeText(clasification));

            if (!classification) {
              continue;
            }

            const category = categoryMap.get(classification.id);

            if (!category) {
              throw new Error(`No existe la categoría para ${classification.name}`);
            }

            const newCredential = credentialRepository.create();

            newCredential.establishmentId = establishmentSave.id;
            newCredential.processId = processSave.id;
            newCredential.classificationId = classification.id;
            newCredential.categoryId = category.id;
            newCredential.startedAt = new Date(initDate);
            newCredential.endedAt = new Date(endDate);
            newCredential.origin = data['origen'];
            newCredential.geographicAreaId = geographicArea.id;

            const state = endDate >= today ? stateCurrent : stateExpired;

            if (state) {
              newCredential.stateCode = state.code;

              newCredential.stateName = state.name;
            }

            await credentialRepository.save(newCredential);
          }

          // ==================================================
          // CREAR CATASTRO
          // ==================================================

          const newCadastre = cadastreRepository.create();

          newCadastre.processId = processSave.id;

          newCadastre.registerNumber = data['numero_registro'];

          newCadastre.registeredAt = new Date(data['fecha_registro']);

          newCadastre.systemOrigin = data['origen'];

          newCadastre.stateId = stateCadastre.id;

          const cadastreSave = await cadastreRepository.save(newCadastre);

          // ==================================================
          // ESTADO DEL CATASTRO
          // ==================================================

          const newCadastreState = cadastreStateRepository.create();

          newCadastreState.cadastreId = cadastreSave.id;

          newCadastreState.stateId = stateCadastre.id;

          newCadastreState.isCurrent = true;

          await cadastreStateRepository.save(newCadastreState);
        });

        resultados.push({
          fila,
          ruc,
          estado: 'OK',
        });

        console.log(`✓ Fila ${fila} procesada correctamente - RUC ${ruc}`);
      } catch (error) {
        console.error(`✗ Error procesando BD - fila ${fila} - RUC ${ruc}`, error);

        errores.push({
          fila,
          ruc,
          etapa: 'BASE_DATOS',
          error: error?.message || 'Error procesando registro en base de datos',
        });
      }
    }

    // ============================================================
    // RESUMEN
    // ============================================================

    console.log('================================================');

    console.log(`Migración finalizada.`);

    console.log(`Total registros: ${dataExcel.length}`);

    console.log(`Procesados correctamente: ${resultados.length}`);

    console.log(`Errores: ${errores.length}`);

    console.log('================================================');

    return {
      total: dataExcel.length,
      procesados: resultados.length,
      errores: errores.length,
      detalleErrores: errores,
    };
  }
}
