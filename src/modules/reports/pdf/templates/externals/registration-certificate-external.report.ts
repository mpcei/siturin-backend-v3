import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { customLayout, defaultDate, defaultFooter, defaultHeader } from '../layouts/layout_4';
import { format } from 'date-fns/format';

export const registrationCertificateExternalReport = (data: any): TDocumentDefinitions => {
  const qrData = `http://localhost:3000/api/v1/enrollment-reports/certificate`;
console.log(data.classifications);
  const legalName = data.user.name;

  let message;

  const list = {
    ul:
      data.classifications && data.classifications.length > 0
        ? data.classifications.map((classification) => ({
            text: classification.classification.name,
            bold: true,
          }))
        : [{ text: 'Sin causas', bold: true }],
  };

  return {
    pageSize: 'A4',
    pageMargins: [40, 85, 40, 40],
    header: defaultHeader(qrData),
    footer: defaultFooter,

    content: [
      {
        text: 'CERTIFICADO DE INACTIVACIÓN',
        style: 'title',
      },
      {
        text: 'MINISTERIO DE PRODUCCIÓN, COMERCIO EXTERIOR E INVERSIONES',
        style: 'subtitle',
        marginBottom: 10,
      },
      {
        text: `Código: ${data.zone.acronym}-${format(data.registeredAt, 'yyyy')}-${data.cadastre.registerNumber.split('.').pop()} `,
        style: 'small',
        marginBottom: 10,
      },
      {
        text: `${data.province.name} - ${data.canton.name}, ${format(data.registeredAt, 'yyyy-MM-dd')}`,
        style: 'date',
      },
      {
        text: 'Señor/a.',
        style: 'small',
        marginBottom: 10,
      },
      {
        text: legalName,
        bold: true,
        style: 'small',
        marginBottom: 10,
      },
      {
        text: message,
        style: 'small',
        marginBottom: 25,
      },
      {
        text: 'INFORMACIÓN DEL GUIA DE TURISMO',
        style: 'label',
        marginBottom: 5,
      },
      {
        table: {
          widths: ['45%', '55%'],
          body: [
            [
              { text: 'R.U.C.:', style: 'tableTitle' },
              { text: data.ruc.number, style: 'defaultText' },
            ],
            [
              { text: 'Código del Establecimiento SRI: ', style: 'tableTitle' },
              { text: data.establishment.number, style: 'defaultText' },
            ],
            [
              { text: 'Nombre Comercial /Razón Social:', style: 'tableTitle' },
              { text: data.ruc.legalName, style: 'defaultText' },
            ],
            [
              { text: 'Actividad:', style: 'tableTitle' },
              { text: data.activity?.name, style: 'defaultText' },
            ],
            [
              { text: 'Clasificaión:', style: 'tableTitle' },
              { text: data.classifications, style: 'defaultText' },
            ],
            [
              { text: 'Categoría:', style: 'tableTitle' },
              { text: data.categories, style: 'defaultText' },
            ],
            [
              { text: 'Número de Registro:', style: 'tableTitle' },
              { text: data.cadastre.registerNumber, style: 'defaultText' },
            ],
            [
              { text: 'Dirección:', style: 'tableTitle' },
              {
                text: `${data.province.name}, ${data.canton.name}, ${data.parish.name}, ${data.establishment.mainStreet}, ${data.establishment.numberStreet}, ${data.establishment.secondaryStreet}, ${data.establishment.referenceStreet}`,
                style: 'defaultText',
              },
            ],
          ],
        },
        layout: customLayout,

        marginBottom: 15,
      },
      {
        text: 'De conformidad a lo establecido en el Acuerdo Interministerial MAATE-MINTUR- 2025-002, el establecimiento se inactiva por la(s) siguiente(s) causal(es):',
        style: 'small',
        marginBottom: 10,
      },
      {
        ...list,
        style: 'small',
        margin: [15, 0, 0, 10],
      },
      {
        text: 'Recuerde que la información proporcionada para el trámite de inactivación será verificada por el Ministerio de Producción, Comercio Exterior e Inversiones y se procederá con el inicio del proceso de sanción previstas en la ley en caso de falsedad o perjurio.',
        style: 'small',
        marginBottom: 10,
      },
      {
        image: `./storage/resources/reports/signatures/${data.zone.code}.png`,
        alignment: 'center',
        marginBottom: 10,
      },
      {
        stack: [
          {
            text: `DIRECTORA ZONAL - ${data.zone.acronym}`,
            style: 'firm',
          },
          {
            text: data.zone.director,
            style: 'firm',
          },
        ],
        margin: [140, 0, 140, 0],
      },
    ],

    styles: {
      title: {
        fontSize: 18,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 5],
      },
      date: {
        fontSize: 8,
        alignment: 'right',
        margin: [0, 5, 0, 5],
      },
      subtitle: {
        alignment: 'center',
        fontSize: 10,
      },
      small: {
        fontSize: 8,
        alignment: 'justify',
      },
      label: {
        fontSize: 15,
        alignment: 'center',
      },
      firm: {
        bold: true,
        fontSize: 13,
        alignment: 'center',
      },
      tableTitle: {
        fontSize: 8,
        bold: true,
        alignment: 'left',
      },
      defaultText: {
        fontSize: 8,
      },
    },
  };
};
