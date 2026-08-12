import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class PrinterService {
  createXlsxBuffer(data: any[]): Buffer {
    console.log('data',data);

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificado');

    return XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });
  }
}
