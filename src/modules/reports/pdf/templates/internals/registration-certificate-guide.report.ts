import { Content, StyleDictionary, TableLayout, TDocumentDefinitions } from 'pdfmake/interfaces';

// Medidas en puntos (pt) para 6cm x 10cm (Portrait)
const CREDENTIAL_WIDTH = 155.91;
const CREDENTIAL_HEIGHT = 240.94;

const customHorizontalLayout: TableLayout = {
  // Grosor de las líneas
  hLineWidth: (i, node) => {
    if (i === 0 || i === node.table.body.length) {
      return 0; // Oculta la línea de arriba del todo y la de abajo del todo
    }
    if (i === 1) {
      return 1; // Línea un poquito más gruesa debajo del título "INFORMACIÓN COMPLEMENTARIA"
    }
    return 0.5; // Líneas divisorias muy finitas entre los datos
  },

  // Sin líneas verticales para mantener el diseño limpio
  vLineWidth: () => 0,

  // Colores extraídos de tu diseño
  hLineColor: (i) => {
    if (i === 1) {
      return '#2A3280'; // El azul oscuro de tu logo/títulos para el acento
    }
    return '#E5E7EB'; // Gris muy suave y moderno para las separaciones internas
  },

  // Espaciado interno (padding) para que respire el texto
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0, // Da un respiro arriba del texto
  paddingBottom: () => 0, // Da un respiro abajo del texto
};

export const registrationCertificateGuideReport = (
  data: any,
  avatarDataUri?: string,
  documentValidatorUrl?: string,
): TDocumentDefinitions => {
  return {
    pageOrientation: 'portrait',
    // Márgenes reducidos significativamente: [Izquierda, Arriba, Derecha, Abajo]
    pageMargins: [5, 2, 5, 2],
    // Tamaño personalizado
    pageSize: { width: CREDENTIAL_WIDTH, height: CREDENTIAL_HEIGHT },

    content: [
      buildPersonalInformation(data, avatarDataUri),
      buildCredentialTable(data),
      buildComplementaryInformation(data),
      {
        pageBreak: 'before',
        text: '',
      },
      buildQR(data, documentValidatorUrl),
      buildImportant(),
      buildSignature(data),
    ],

    background: (currentPage: number) => {
      // Los fondos deben ajustarse al tamaño exacto de la credencial
      if (currentPage === 1) {
        return {
          image: './storage/resources/reports/layouts/background_certificate_guide_1.png',
          width: CREDENTIAL_WIDTH,
          height: CREDENTIAL_HEIGHT,
        };
      } else if (currentPage === 2) {
        return {
          image: './storage/resources/reports/layouts/background_certificate_guide_2.png',
          width: CREDENTIAL_WIDTH,
          height: CREDENTIAL_HEIGHT,
        };
      }
      return null;
    },

    styles: styles,
  };
};

export const styles: StyleDictionary = {
  // Tamaños de fuente drásticamente reducidos para entrar en 6x10 cm
  headerTitle: {
    font: 'Montserrat',
    fontSize: 8,
    bold: true,
    color: '#2A3280', // Azul oscuro
    alignment: 'center',
  },
  headerSubtitle: {
    font: 'Montserrat',
    fontSize: 7,
    bold: true,
    color: '#70738A', // Azul/morado más claro (como en tu imagen)
    alignment: 'center',
  },
  title: {
    fontSize: 8,
    bold: true,
    alignment: 'center',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 4,
    bold: true,
    alignment: 'center',
    color: '#1F2937',
  },
  personName: {
    fontSize: 6,
    bold: true,
    alignment: 'center',
    color: '#000000',
  },
  important: {
    fontSize: 5,
    bold: true,
    alignment: 'center',
    color: '#424141',
  },
  signature: {
    fontSize: 5,
    bold: true,
    alignment: 'center',
    color: '#000000',
  },
  registration: {
    fontSize: 5,
    alignment: 'center',
    color: '#4B5563',
  },
  tableHeader: {
    fontSize: 5,
    bold: true,
    color: '#000000',
    fillColor: '#E5E7EB',
    alignment: 'left',
    margin: [1, 0, 0, 0],
  },
  tableText: {
    fontSize: 4,
    color: '#374151',
    alignment: 'left',
    margin: [1, 2, 1, 2],
  },
  label: {
    fontSize: 4,
    bold: true,
    color: '#000000',
    margin: [2, 2, 2, 2],
    alignment: 'left',
  },
  value: {
    fontSize: 4,
    color: '#374151',
    margin: [2, 2, 2, 2],
    alignment: 'left',
  },
  small: {
    fontSize: 4,
    color: '#6B7280',
  },
  bold: { bold: true },
  center: { alignment: 'center' },
  right: { alignment: 'right' },
};

const buildPersonalInformation = (data: any, avatarDataUri): Content => ({
  stack: [
    {
      // Usamos columns para poner texto a la izquierda y foto a la derecha
      columns: [
        {
          // Columna izquierda: Textos
          width: '*', // Toma todo el espacio disponible
          stack: [
            { text: 'REGISTRO DE TURISMO', style: 'headerTitle' },
            { text: `Nro. ${data.cadastre.registerNumber}`, style: 'registration' },
          ],
          margin: [0, 20, 0, 0], // Margen superior para alinear un poco con la foto
        },
      ],
    },
    {
      // Columna derecha: Foto
      width: 50, // Ancho fijo para la columna de la foto
      image: avatarDataUri,
      fit: [74, 85], // Tamaño de la foto
      alignment: 'center',
    },
    { text: 'GUÍA DE TURISMO', style: 'headerSubtitle' },
    {
      text: data.user.name,
      style: 'personName',
      margin: [0, 4, 0, 2],
    },
  ],
});

const buildCredentialTable = (data: any): Content => ({
  margin: [0, 5, 0, 5],
  table: {
    headerRows: 1,
    widths: ['*', 30], // Anchos de columnas ajustados al nuevo tamaño
    body: [
      [
        { text: 'Clasificación', style: 'tableHeader' },
        { text: 'Caducidad', style: 'tableHeader' },
      ],
      ...data.credentials.map((c: any) => [
        { text: `${c.classification.name}`, style: 'tableText' },
        { text: c.endedAt, style: 'tableText' },
      ]),
    ],
  },
  layout: customHorizontalLayout,
});

const buildComplementaryInformation = (data: any): Content => ({
  stack: [
    {
      table: {
        headerRows: 1,
        widths: [70, '*'], // Reducido para encajar en el ancho de 170.1
        body: [
          [
            {
              text: 'INFORMACIÓN COMPLEMENTARIA',
              style: 'tableHeader',
              colSpan: 2,
              alignment: 'center',
            },
            {},
          ],
          [
            { text: 'ÁREAS PROTEGIDAS:', style: 'label' },
            { text: data.protectedAreas, style: 'value' },
          ],
          [
            { text: 'MODALIDADES DE AVENTURA:', style: 'label' },
            { text: data.adventureModalities, style: 'value' },
          ],
        ],
      },
      layout: customHorizontalLayout,
    },
  ],
});

const buildQR = (data: any, documentValidatorUrl): Content => ({
  stack: [
    {
      qr: `${documentValidatorUrl}${data.cadastre.registerNumber}`,
      fit: 50, // QR reducido
      alignment: 'center',
      margin: [0, 30, 0, 0],
    },
  ],
});

const buildImportant = (): Content => ({
  stack: [
    {
      text: 'IMPORTANTE',
      style: 'important',
      fontSize: 7,
      margin: [0, 10, 0, 2],
    },
    {
      text: 'El presente documento acredita el Registro de Turismo conferido por la Autoridad Nacional de Turismo conforme al Art. 47 del Reglamento General de Aplicación a la Ley de Turismo.',
      style: 'important',
      margin: [0, 3, 0, 2],
    },
    {
      text: 'El registro es personal e intransferible y deberá mantenerse actualizado.',
      style: 'important',
      margin: [0, 3, 0, 2],
    },
    {
      text: 'El incumplimiento generará sanciones previstas en el Art. 52 de la Ley de Turismo.',
      style: 'important',
      margin: [0, 3, 0, 2],
    },
  ],
});

const buildSignature = (data: any): Content => ({
  stack: [
    {
      image: `./storage/resources/reports/signatures/DZ${data.zone.code}.png`,
      fit: [45, 25], // Firma reducida
      style: 'signature',
      margin: [0, 15, 0, 2],
    },
    {
      text: 'Firma institucional',
      style: 'signature',
      margin: [0, 2, 0, 2],
    },
    {
      text: `DIRECTOR/A ZONAL - ${data.zone.acronym}`,
      style: 'signature',
      bold: true,
      margin: [0, 2, 0, 1],
    },
    {
      text: data.zone.director,
      style: 'signature',
      bold: true,
      margin: [0, 1, 0, 2],
    },
  ],
});
