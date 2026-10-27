import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheEnum, ConfigEnum, PublicRepositoryEnum } from '@utils/enums';
import { DataSource, Repository } from 'typeorm';
import { ConsultaCatastroEntity } from '@modules/core/entities/consulta-catastro.entity';

interface ErrorFila {
  fila: number;
  ruc: string | null;
  campo: string;
  valorRecibido: unknown;
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
   /* @Inject(PublicRepositoryEnum.CONSULTA_CATASTRO)
    private readonly ConsultaCatastroRepository: Repository<ConsultaCatastroEntity>,*/
  ) {}

  /**
   * Lee el archivo Excel, procesa sus registros
   * y los almacena en Redis mediante CACHE_MANAGER.
   */
  /* async saveExcelCadastre(file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new Error('No se recibió un archivo Excel válido.');
    }

    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
      cellDates: true,
    });

    //const sheetName = workbook.SheetNames[0];

    /!*if (!sheetName) {
      throw new Error('El archivo Excel no contiene hojas.');
    }*!/

    const worksheet = workbook.Sheets['catrastro'];

    const dataExcel = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

    const cadastre: CadastreInterface[] = dataExcel.map((item) => ({
      ruc: this.format13Digits(item['ruc']),
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
    }));

    console.log(cadastre.length);

    // Almacena el catálogo completo en la caché.
    // TTL 0 solicita que no expire, según la configuración
    // y el adaptador de caché utilizados por el proyecto.
    await this.cacheManager.set(CacheEnum.SEARCH_CADASTRE, cadastre, 0);

    return {
      message: 'Archivo procesado y almacenado correctamente.',
      totalRecords: cadastre.length,
    };
  }*/

  async saveExcelCadastre(file: Express.Multer.File) {
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

    const errores: ErrorFila[] = [];
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
          errores.push({
            fila: filaExcel,
            ruc: ruc || null,
            campo,
            valorRecibido: valor,
            error: 'El campo es obligatorio.',
          });
        }
      }

      if (ruc && !/^\d{1,13}$/.test(ruc)) {
        errores.push({
          fila: filaExcel,
          ruc,
          campo: 'ruc',
          valorRecibido: rucOriginal,
          error: 'El RUC debe contener máximo 13 dígitos numéricos.',
        });
      }

      /*// Validar fecha antes de convertirla.
      const fecha = item['fecha_registro'];

      if (fecha !== null && fecha !== undefined && String(fecha).trim() !== '') {
        const fechaValida = this.validarFechaExcel(fecha);

        if (!fechaValida) {
          errores.push({
            fila: filaExcel,
            ruc: ruc || null,
            campo: 'fecha_registro',
            valorRecibido: fecha,
            error: 'La fecha no es válida o tiene un formato incorrecto.',
          });
        }
      }*/

      // No preparar entidades de filas con datos obligatorios faltantes
      // o con un RUC inválido.
      const filaTieneError = errores.some((error) => error.fila === filaExcel);

      if (filaTieneError) {
        continue;
      }

      try {
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
      } catch (error) {
        errores.push({
          fila: filaExcel,
          ruc: ruc || null,
          campo: 'registro',
          valorRecibido: null,
          error: error instanceof Error ? error.message : 'Error al procesar la fila.',
        });
      }
    }

    // Si existe cualquier error, no tocar la base de datos.
    if (errores.length > 0) {
      throw new BadRequestException({
        message: 'La carga fue cancelada. Corrija los errores del archivo e intente nuevamente.',
        totalFilas: dataExcel.length,
        totalErrores: errores.length,
        errores,
      });
    }

    // Segunda etapa: reemplazar la carga anterior de forma atómica.
    return this.dataSourceV3.transaction(async (manager) => {
      const repository = manager.getRepository(ConsultaCatastroEntity);

      await repository.clear();

      await repository.save(
        cadastres.map((item) => repository.create(item)),
        { chunk: 500 },
      );

      return {
        message: 'Catastro importado correctamente.',
        totalFilas: dataExcel.length,
        totalErrores: 0,
        totalRegistrosCargados: cadastres.length,
      };
    });
  }

  private validarFechaExcel(valor: unknown): boolean {
    if (valor instanceof Date) {
      return !Number.isNaN(valor.getTime());
    }

    const texto = String(valor).trim();

    // Formato dd/mm/yyyy
    const coincidencia = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (coincidencia) {
      const dia = Number(coincidencia[1]);
      const mes = Number(coincidencia[2]);
      const anio = Number(coincidencia[3]);

      const fecha = new Date(anio, mes - 1, dia);

      return (
        fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia
      );
    }

    // Otros formatos requieren una regla explícita.
    return false;
  }

  /**
   * Recupera todos los registros almacenados en caché.
   */
  async findCadastre(): Promise<CadastreInterface[]> {
    const cadastres = await this.cacheManager.get<CadastreInterface[]>(CacheEnum.SEARCH_CADASTRE);

    if (cadastres == null) {
      throw new NotFoundException('No existen registros de catastro almacenados en caché.');
    }

    return cadastres;
  }

  /**
   * Recupera los registros y genera nuevamente el Excel
   * para que el controlador pueda enviarlo como descarga.
   */
  async downloadExcelCadastre(): Promise<Buffer> {
    const cadastres = await this.findCadastre();

    const rows = cadastres.map((item) => ({
      ruc: item.ruc,
      numero_establecimiento: item.numberEstablishment,
      nombre_comercial: item.tradeName,
      numero_registro: item.registerNumber,
      fecha_registro: item.registeredAt,
      actividad: item.activity,
      clasificacion: item.classification,
      categoria: item.category,
      razon_social: item.legalName,
      representante_legal: item.legalRepresentative,
      provincia: item.province,
      canton: item.canton,
      parroquia: item.parish,
      tipo_parroquia: item.typeParish,
      direccion: item.address,
      referencia_direccion: item.referenceAddress,
      phone: item.phone,
      correo: item.email,
      pagina_web: item.webPage,
      estado_registro: item.stateCadastre,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Fuerza las columnas RUC y número de establecimiento
    // a tipo texto para conservar los ceros iniciales.
    const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1');

    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      for (const col of [0, 1]) {
        const address = XLSX.utils.encode_cell({
          r: row,
          c: col,
        });

        const cell = worksheet[address];

        if (cell) {
          cell.t = 's';
          cell.v = String(cell.v ?? '');
        }
      }
    }

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Catastro');

    return XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;
  }

  /**
   * Busca todos los establecimientos asociados a un RUC.
   */
  async findCadastreByRuc(params: any): Promise<CadastreInterface[]> {
    console.log(params);
    if (Object.keys(params).length === 0) {
      const cadastres = await this.cacheManager.get<CadastreInterface[]>(CacheEnum.SEARCH_CADASTRE);

      return cadastres ? cadastres : [];
    }
    const ruc = params.ruc;
    const rucBuscado = String(ruc ?? '').trim();

    if (!/^\d{13}$/.test(rucBuscado)) {
      throw new NotFoundException('El RUC debe contener exactamente 13 dígitos numéricos.');
    }

    const cadastres = await this.findCadastre();

    return cadastres.filter((item) => item.ruc === rucBuscado);
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

    // Evita convertir notación científica o decimales
    // de forma silenciosa en un RUC incorrecto.
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
