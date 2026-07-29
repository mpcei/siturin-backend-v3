import { Content, StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';

export const registrationCertificateGuideReport = (data: any): TDocumentDefinitions => {
  return {
    pageOrientation: 'portrait',
    pageMargins: [30, 140, 30, 40],
    pageSize: 'A4',

    content: [
      {
        stack: [
          buildPersonalInformation(data),
          buildCredentialTable(data),
          buildComplementaryInformation(data),
        ],
        margin: [0, 40, 0, 0],
      },
      {
        pageBreak: 'before',
        text: '',
      },
      buildQR(data),
      buildImportant(),
      buildSignature(data),
    ],

    background: (currentPage: number) => {
      if (currentPage === 1) {
        return {
          image: './storage/resources/reports/layouts/background_certificate_guide_1.png',
          width: 580,
          height: 810,
        };
      } else if (currentPage === 2) {
        return {
          image: './storage/resources/reports/layouts/background_certificate_guide_2.png',
          width: 580,
          height: 810,
        };
      }
      return null;
    },

    styles: styles,
  };
};

export const styles: StyleDictionary = {
  title: {
    fontSize: 18,
    bold: true,
    alignment: 'center',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 14,
    bold: true,
    alignment: 'center',
    color: '#1F2937',
  },

  personName: {
    fontSize: 12,
    bold: true,
    alignment: 'center',
    color: '#000000',
  },

  important: {
    fontSize: 13,
    bold: true,
    alignment: 'center',
    color: '#424141',
  },

  signature: {
    fontSize: 13,
    bold: true,
    alignment: 'center',
    color: '#000000',
  },

  registration: {
    fontSize: 10,
    alignment: 'center',
    color: '#4B5563',
    margin: [0, 2, 0, 0],
  },

  tableHeader: {
    fontSize: 9,
    bold: true,
    color: '#000000',
    fillColor: '#E5E7EB',
    alignment: 'center',
    margin: [0, 5, 0, 5],
  },

  tableText: {
    fontSize: 9,
    color: '#374151',
    margin: [3, 5, 3, 5],
  },

  label: {
    fontSize: 10,
    bold: true,
    color: '#000000',
    margin: [5, 8, 5, 8],
  },

  value: {
    fontSize: 10,
    color: '#374151',
    margin: [5, 8, 5, 8],
  },

  small: {
    fontSize: 8,
    color: '#6B7280',
  },

  bold: {
    bold: true,
  },

  center: {
    alignment: 'center',
  },

  right: {
    alignment: 'right',
  },
};

const buildPersonalInformation = (data: any): Content => ({
  stack: [
    {
      image: `./storage/resources/reports/images/guide.png`,
      fit: [120, 140],
      alignment: 'center',
    },

    {
      text: data.user.name.toUpperCase(),
      style: 'personName',
      margin: [0, 10, 0, 5],
    },

    {
      text: `REGISTRO DE TURISMO: ${data.cadastre.registerNumber}`,
      style: 'registration',
    },
  ],
});

const buildSeparator = (): Content => ({
  margin: [0, 20, 0, 20],

  canvas: [
    {
      type: 'line',
      x1: 0,
      y1: 0,
      x2: 545,
      y2: 0,
      lineColor: '#D62828',
      lineWidth: 2,
    },
  ],
});

const buildCredentialTable = (data: any): Content => ({
  table: {
    headerRows: 1,

    widths: ['*', 100, 100],

    body: [
      [
        { text: 'Tipo', style: 'tableHeader' },
        { text: 'Emisión', style: 'tableHeader' },
        { text: 'Caducidad', style: 'tableHeader' },
      ],

      ...data.credentials.map((c: any) => [c.classification.name, c.startedAt, c.endedAt]),
    ],
  },

  layout: 'lightHorizontalLines',
});

const buildComplementaryInformation = (data: any): Content => ({
  stack: [
    {
      text: 'INFORMACIÓN COMPLEMENTARIA',
      style: 'subtitle',
      margin: [0, 20, 0, 10],
    },

    {
      table: {
        widths: [180, '*'],

        body: [
          ['ÁREAS PROTEGIDAS AUTORIZADAS:', data.protectedAreas],

          ['MODALIDAD DE AVENTURA:', data.adventureModalities],
        ],
      },
    },
  ],
});

const buildQR = (data: any): Content => ({
  stack: [
    {
      qr: `https://registro.turismo.gob.ec/consulta/${data.cadastre.registerNumber}`,
      fit: 100,
      alignment: 'center',
    },
  ],
});

const buildImportant = (): Content => ({
  stack: [
    {
      text: 'IMPORTANTE',
      style: 'important',
      fontSize: 16,
      margin: [0, 40, 0, 5],
    },
    {
      text: 'El presente documento acredita el Registro de Turismo conferido por la Autoridad Nacional de Turismo conforme al Art. 47 del Reglamento General de Aplicación a la Ley de Turismo',
      style: 'important',
      margin: [0, 20, 0, 5],
    },
    {
      text: 'El registro es personal e intransferible y deberá mantenerse actualizado dentro del plazo establecido',
      style: 'important',
      margin: [0, 20, 0, 5],
    },
    {
      text: 'El incumplimiento de obligaciones podrá generar las sanciones previstas en el Art. 52 de la Ley  de Turismo, literal a,b,c.',
      style: 'important',
      margin: [0, 20, 0, 5],
    },
  ],
});

const buildSignature = (data: any): Content => ({
  stack: [
    {
      image: `./storage/resources/reports/signatures/dz6.png`,
      fit: [120, 140],
      style: 'signature',
      margin: [0, 100, 0, 5],
    },
    {
      text: 'Firma institucional',
      style: 'signature',
      margin: [0, 10, 0, 5],
    },
    {
      text: `DIRECTOR/A ZONAL 6 - DZ6`,
      style: 'signature',
      bold: true,
      margin: [0, 10, 0, 5],
    },
    {
      text: `DAVID GUSTAVO ESTRELLA SALAZAR`,
      style: 'signature',
      bold: true,
      margin: [0, 10, 0, 5],
    },
  ],
});
