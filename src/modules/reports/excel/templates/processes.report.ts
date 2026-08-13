import { differenceInCalendarDays } from 'date-fns';

export const processesReport = (data: any) => {
  return data.map((item) => ({
    'Número de Registro': item.process.cadastre,
    'Código del Establecimiento': item.process.establishment.number,
    'Razón Social': item.process.establishment.ruc.legalName,
    'Ubicación': item.process.establishment.province,
    'Clasificación': item.process.credentials.map((item1) => item1.classification.name).join(', '),
    'Trámite': item.process.type.name,
    'Estado del Registro': item.process.cadastre.state.name,
    'Fecha solicitud': item.process.createdAt,
    'Tiempo transcurrido': differenceInCalendarDays(new Date(), item.process.createdAt),
  }));
};
