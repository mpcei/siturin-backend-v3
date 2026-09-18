import { Content, StyleDictionary, TDocumentDefinitions, TableLayout } from 'pdfmake/interfaces';

const CREDENTIAL_WIDTH = 156;
const CREDENTIAL_HEIGHT = 241;

const cutGuideLayout: TableLayout = {
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => '#9CA3AF',
  vLineColor: () => '#9CA3AF',
  hLineStyle: () => ({ dash: { length: 4, space: 4 } }),
  vLineStyle: () => ({ dash: { length: 4, space: 4 } }),
  paddingLeft: () => 10,
  paddingRight: () => 10,
  paddingTop: () => 10,
  paddingBottom: () => 10,
};

export const registrationCertificateGuideReport = (
  data: any,
  avatarDataUri?: string,
  documentValidatorUrl?: string,
): TDocumentDefinitions => {
  return {
    pageOrientation: 'portrait',
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],

    content: [
      {
        text: 'CREDENCIALES LISTAS PARA RECORTAR',
        fontSize: 12,
        bold: true,
        alignment: 'left',
        margin: [0, 0, 0, 20],
      },
      {
        alignment: 'center',
        columns: [
          // =======================
          // CARA 1: FRENTE
          // =======================
          {
            width: CREDENTIAL_WIDTH + 20,
            table: {
              widths: [CREDENTIAL_WIDTH],
              heights: [CREDENTIAL_HEIGHT],
              body: [
                [
                  {
                    border: [true, true, true, true],
                    stack: [
                      // 1. Imagen de fondo renderizada primero
                      {
                        image:
                          './storage/resources/reports/layouts/background_certificate_guide_1.png',
                        width: CREDENTIAL_WIDTH,
                        height: CREDENTIAL_HEIGHT,
                      },
                      // 2. Contenedor de texto superpuesto
                      {
                        stack: [
                          buildPersonalInformation(data, avatarDataUri),
                          buildCredentialTable(data),
                          buildComplementaryInformation(data),
                        ],
                        // El margen negativo "jala" el texto hacia arriba exactamente el mismo tamaño de la imagen
                        margin: [0, -CREDENTIAL_HEIGHT + 15, 0, 0],
                      },
                    ],
                  },
                ],
              ],
            },
            layout: cutGuideLayout,
          },

          // ESPACIO ENTRE LAS DOS CREDENCIALES
          { width: 20, text: '' },

          // =======================
          // CARA 2: REVERSO
          // =======================
          {
            width: CREDENTIAL_WIDTH + 20,
            table: {
              widths: [CREDENTIAL_WIDTH],
              heights: [CREDENTIAL_HEIGHT],
              body: [
                [
                  {
                    border: [true, true, true, true],
                    stack: [
                      // 1. Imagen de fondo del reverso
                      {
                        image:
                          './storage/resources/reports/layouts/background_certificate_guide_2.png',
                        alignment: 'left',
                        width: CREDENTIAL_WIDTH,
                        height: CREDENTIAL_HEIGHT,
                      },
                      // 2. Contenedor de texto superpuesto
                      {
                        stack: [
                          buildQR(data, documentValidatorUrl),
                          buildImportant(),
                          buildSignature(data),
                        ],
                        // Margen negativo
                        margin: [0, -CREDENTIAL_HEIGHT + 40, 0, 0],
                      },
                    ],
                  },
                ],
              ],
            },
            layout: cutGuideLayout,
          },
        ],
      },
    ],

    // Eliminamos la propiedad background: (currentPage) => {...} global.
    styles: styles,
  };
};

// ... (Aquí van las funciones buildPersonalInformation, buildImportant, etc. que te pasé antes)
export const styles: StyleDictionary = {
  // Tamaños de fuente drásticamente reducidos para entrar en 6x10 cm
  headerTitle: {
    font: 'Montserrat',
    fontSize: 8,
    bold: true,
    color: '#2A3280', // Azul oscuro
    alignment: 'center',
    margin: [0, 5, 0, 0],
  },
  headerSubtitle: {
    font: 'Montserrat',
    fontSize: 7,
    bold: true,
    color: '#70738A', // Azul/morado más claro (como en tu imagen)
    alignment: 'left',
    margin: [0, 10, 0, 0],
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
    fontSize: 7,
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
    margin: [0, 2, 0, 0],
  },
  tableHeader: {
    fontSize: 5,
    bold: true,
    color: '#000000',
    fillColor: '#E5E7EB',
    alignment: 'left',
    margin: [0, 2, 0, 2],
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
  },
  value: {
    fontSize: 4,
    color: '#374151',
    margin: [2, 2, 2, 2],
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
          // Columna derecha: Foto
          width: 45, // Ancho fijo para la columna de la foto
          image: avatarDataUri,
          fit: [45, 55], // Tamaño de la foto
          alignment: 'right',
        },
        {
          // Columna izquierda: Textos
          width: '*', // Toma todo el espacio disponible
          stack: [
            { text: 'REGISTRO DE TURISMO', style: 'headerTitle' },
            { text: `Nro. ${data.cadastre.registerNumber}`, style: 'registration' },
            { text: 'GUÍA DE TURISMO', style: 'headerSubtitle' },
          ],
          margin: [0, 5, 0, 0], // Margen superior para alinear un poco con la foto
        },
      ],
    },
    {
      text: data.user.name.toUpperCase(),
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
  layout: 'lightHorizontalLines',
});

const buildComplementaryInformation = (data: any): Content => ({
  stack: [
    {
      text: 'INFORMACIÓN COMPLEMENTARIA',
      style: 'subtitle',
      margin: [0, 5, 0, 3],
    },
    {
      table: {
        widths: [70, '*'], // Reducido para encajar en el ancho de 170.1
        body: [
          [
            { text: 'ÁREAS PROTEGIDAS:', style: 'label' },
            { text: 'MODALIDADES DE AVENTURA:', style: 'label' },
          ],
          [
            { text: data.protectedAreas, style: 'value' },
            { text: data.adventureModalities, style: 'value' },
          ],
        ],
      },
      layout: 'noBorders',
    },
  ],
});

const buildQR = (data: any, documentValidatorUrl): Content => ({
  stack: [
    {
      qr: `${documentValidatorUrl}${data.cadastre.registerNumber}`,
      fit: 50, // QR reducido
      alignment: 'center',
      margin: [0, 10, 0, 0],
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
      image: `./storage/resources/reports/signatures/dz6.png`,
      fit: [45, 25], // Firma reducida
      style: 'signature',
      margin: [0, 15, 0, 2],
    },
    {
      text: `DIRECTOR/A ZONAL 6 - DZ6`,
      style: 'signature',
      bold: true,
      margin: [0, 2, 0, 1],
    },
    {
      text: `DAVID GUSTAVO ESTRELLA SALAZAR`,
      style: 'signature',
      bold: true,
      margin: [0, 1, 0, 2],
    },
  ],
});
