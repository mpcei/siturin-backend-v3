import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigEnum, PublicRepositoryEnum } from '@utils/enums';
import { DataSource, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { ConsultaCatastroEntity } from '@modules/core/entities/consulta-catastro.entity';
import { ResponseHttpInterface, ServiceResponseHttpInterface } from '@utils/interfaces';
import { FindCadastreDto } from '@modules/core/shared-core/dto/search-cadastre/find-cadastre.dto';
import { UserEntity } from '@auth/entities';
import { DocumentCadastreDto } from '@modules/core/shared-core/dto/search-cadastre/document-cadastre.dto';
import { DocumentoCatastroEntity } from '@modules/core/entities/documento-catastro.entity';
import { FileService } from '@modules/common/file/file.service';

interface ErrorFila {
  row: number;
  ruc: string | null;
  column: string;
  value: unknown;
  error: string;
}

export interface CadastreInterface {
  ruc: string;
  numberEstablishment: string;
  tradeName: string;
  registerNumber: string;
  registeredAt: string;
  activity: string;
  classification: string;
  category: string;
  legalName: string;
  legalRepresentative: string;
  province: string;
  canton: string;
  parish: string;
  typeParish: string;
  address: string;
  referenceAddress: string;
  phone: string;
  email: string;
  webPage: string;
  stateCadastre: string;
}

@Injectable()
export class SearchCadastreService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(ConfigEnum.PG_DATA_SOURCE)
    private readonly dataSourceV3: DataSource,
    private readonly fileService: FileService,
    @Inject(PublicRepositoryEnum.CONSULTA_CATASTRO)
    private readonly consultaCatastroRepository: Repository<ConsultaCatastroEntity>,
    @Inject(PublicRepositoryEnum.DOCUMENTO_CATASTRO)
    private readonly documentoCatastroRepository: Repository<DocumentoCatastroEntity>,
  ) {}

  async saveExcelCadastre(
    payload: DocumentCadastreDto,
    user: UserEntity,
    file: Express.Multer.File,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException({
        message: 'No se ha proporcionado un archivo Excel válido.',
        errores: [],
      });
    }
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(file.buffer, { type: 'buffer' });
    } catch {
      throw new BadRequestException({
        message: 'No se pudo leer el archivo Excel.',
        errores: [],
      });
    }
    const worksheet = workbook.Sheets['catrastro'];
    if (!worksheet) {
      throw new BadRequestException({
        message: 'El archivo no contiene la hoja "catrastro".',
        errores: [],
      });
    }
    const dataExcel: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
      defval: null,
      raw: false,
    });
    if (dataExcel.length === 0) {
      throw new BadRequestException({
        message: 'El archivo no contiene registros para importar.',
        errores: [],
      });
    }
    const errors: ErrorFila[] = [];
    const cadastres: Partial<ConsultaCatastroEntity>[] = [];
    const camposObligatorios = ['ruc', 'numero_establecimiento'];
    // Primera etapa: validar y preparar todas las filas.
    for (let i = 0; i < dataExcel.length; i++) {
      const item = dataExcel[i];
      const filaExcel = i + 2; // Fila 1: encabezados.
      const rucOriginal = item['ruc'];
      const ruc = rucOriginal == null ? '' : String(rucOriginal).trim();
      for (const campo of camposObligatorios) {
        const valor = item[campo];
        if (valor === null || valor === undefined || String(valor).trim() === '') {
          errors.push({
            row: filaExcel,
            ruc: ruc || null,
            column: campo,
            value: valor,
            error: 'El campo es obligatorio.',
          });
        }
      }
      if (ruc && !/^\d{1,13}$/.test(ruc)) {
        errors.push({
          row: filaExcel,
          ruc,
          column: 'ruc',
          value: rucOriginal,
          error: 'El RUC debe contener máximo 13 dígitos numéricos.',
        });
      }
      // No preparar entidades de filas con datos obligatorios faltantes o con un RUC inválido.
      /*      const filaTieneError = errors.some((error) => error.row === filaExcel);
      if (filaTieneError) {
        continue;
      }*/
      try {
        //const cadastreExists = cadastres.find((c) => c.registerNumber === item['numero_registro']);
        const index = cadastres.findIndex((c) => c.registerNumber === item['numero_registro']);
        if (index === -1) {
          cadastres.push({
            ruc: this.format13Digits(ruc),
            numberEstablishment: this.format3Digits(item['numero_establecimiento']),
            tradeName: this.clearText(item['nombre_comercial']),
            registerNumber: this.clearText(item['numero_registro']),
            registeredAt: this.formatDate(item['fecha_registro']),
            activity: this.clearText(item['actividad']),
            classification: this.clearText(item['clasificacion']),
            category: this.clearText(item['categoria']),
            legalName: this.clearText(item['razon_social']),
            legalRepresentative: this.clearText(item['representante_legal']),
            province: this.clearText(item['provincia']),
            canton: this.clearText(item['canton']),
            parish: this.clearText(item['parroquia']),
            typeParish: this.clearText(item['tipo_parroquia']),
            address: this.clearText(item['direccion']),
            referenceAddress: this.clearText(item['referencia_direccion']),
            phone: this.clearText(item['telefono']),
            email: this.clearText(item['correo']),
            webPage: this.clearText(item['pagina_web']),
            stateCadastre: this.clearText(item['estado_registro']),
          });
        } else {
          errors.push({
            row: filaExcel,
            ruc: ruc || null,
            column: 'numero_registro',
            value: item['numero_registro'],
            error: `Error en el numero registro. Ya se encuentra en la fila. ${index + 2}`,
          });
        }
      } catch (error) {
        errors.push({
          row: filaExcel,
          ruc: ruc || null,
          column: 'registro',
          value: null,
          error: error instanceof Error ? error.message : 'Error al procesar la fila.',
        });
      }
    }

    // Si existe cualquier error, no tocar la base de datos.
    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'La carga fue cancelada. Corrija los errores del archivo e intente nuevamente.',
        title: 'Errores en la carga',
        data: { totalRows: dataExcel.length, totalErrors: errors.length, errors },
      });
    }

    // Segunda etapa: reemplazar la carga anterior de forma atómica.
    return this.dataSourceV3.transaction(async (manager) => {
      const repository = manager.getRepository(ConsultaCatastroEntity);
      const repositoryDocumentCadastre = manager.getRepository(DocumentoCatastroEntity);

      const documentCadastre = repositoryDocumentCadastre.create();
      documentCadastre.userId = user.id;
      documentCadastre.year = payload.year;
      documentCadastre.month = payload.month;
      documentCadastre.period = payload.period;
      const documentCadastreSave = await repositoryDocumentCadastre.save(documentCadastre);

      await this.fileService.uploadFile({
        file,
        user,
        modelId: documentCadastreSave.id,
        folder: 'consulta-catastros',
        manager,
      });

      await repository.clear();

      await repository.save(
        cadastres.map((item) => repository.create(item)),
        { chunk: 500 },
      );

      return {
        message: 'Catastro importado correctamente.',
        title: 'Cargado correctamente',
        data: {
          totalRows: dataExcel.length,
          totalErrors: 0,
          totalLoaded: cadastres.length,
        },
      };
    });
  }

  async findCadastres(params: FindCadastreDto): Promise<ServiceResponseHttpInterface> {
    const { ruc, tradeName, canton, activity } = params;

    const where: FindOptionsWhere<ConsultaCatastroEntity> = {};

    if (ruc) {
      where.ruc = ILike(`%${ruc.trim()}%`);
    }
    if (tradeName) {
      where.tradeName = ILike(`%${tradeName.trim()}%`);
    }
    if (canton) {
      where.canton = ILike(`%${canton.trim()}%`);
    }
    if (activity) {
      where.activity = ILike(`%${activity.trim()}%`);
    }

    const response = await this.consultaCatastroRepository.findAndCount({
      where: {
        stateCadastre: ILike(`%RATIFICADO%`),
        ...where,
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    return {
      data: response[0],
      pagination: { limit: params.limit, totalItems: response[1] },
    };
  }

  async findDocumentCadastre(): Promise<ResponseHttpInterface> {
    const response = await this.documentoCatastroRepository.find({
      //relations: { file: true },
      take: 1,
      order: { createdAt: 'DESC' },
    });

    return {
      data: response,
      title: 'Busqueda exitosa',
      message: '',
    };
  }

  async findCadastreByRuc(ruc: string): Promise<ResponseHttpInterface> {
    const response = await this.consultaCatastroRepository.find({
      where: { ruc: ruc },
    });

    return {
      data: response.length > 0,
      title: 'Busqueda exitosa',
      message: '',
    };
  }

  /**
   * Limpia y normaliza los valores de texto.
   */
  private clearText(valor: unknown): string {
    if (valor == null) {
      return '';
    }
    return String(valor)
      .replace(/[\x00-\x1F\x7F]/g, '')
      .replace(/;/g, '')
      .replace(/,/g, '')
      .replace(/'/g, '-')
      .replace(/"/g, '')
      .replace(/\n/g, '...')
      .replace(/\t/g, ' ')
      .trim()
      .replace(/ +/g, ' ');
  }

  /**
   * Completa el RUC hasta 13 dígitos.
   */
  private format13Digits(valor: unknown): string {
    if (valor == null || String(valor).trim() === '') {
      return '';
    }
    const value = String(valor).trim();
    // Evita convertir notación científica o decimales de forma silenciosa en un RUC incorrecto.
    if (!/^\d+$/.test(value)) {
      return value;
    }
    return value.padStart(13, '0');
  }

  /**
   * Completa el número de establecimiento hasta 3 dígitos.
   */
  private format3Digits(valor: unknown): string {
    if (valor == null || String(valor).trim() === '') {
      return '';
    }
    const value = String(valor).trim();
    if (!/^\d+$/.test(value)) {
      return value;
    }
    return value.padStart(3, '0');
  }

  /**
   * Convierte las fechas al formato dd/mm/yyyy.
   */
  private formatDate(valor: unknown): string {
    if (valor == null || valor === '') {
      return '';
    }
    let fecha: Date;
    if (valor instanceof Date) {
      fecha = valor;
    } else if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      const [anio, mes, dia] = valor.split('-').map(Number);
      fecha = new Date(anio, mes - 1, dia);
    } else {
      fecha = new Date(valor as string | number);
    }
    if (Number.isNaN(fecha.getTime())) {
      return '';
    }
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }
}
