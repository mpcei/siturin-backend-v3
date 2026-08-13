import { differenceInCalendarDays, differenceInDays } from 'date-fns';

export const processesReport = (data: any) => {
  return data.map((item) => ({
    'Número de Registro': item.process?.cadastre
      ? item.process?.cadastre.registerNumber
      : 'Sin registro',
    'Código del Establecimiento': item.process.establishment.number,
    'Razón Social': item.process.establishment.ruc.legalName,
    Ubicación: `${item.process.establishment.province.name} ${item.process.establishment.canton.name} ${item.process.establishment.parish.name}` ,
    Clasificación: item.process.credentials.map((item1) => item1.classification.name).join(', '),
    Trámite: item.process.type.name,
    'Estado del Registro': item.process?.cadastre?.state
      ? item.process.cadastre.state.name
      : 'Sin registro',
    'Fecha solicitud': item.process.createdAt,
    'Tiempo transcurrido': `${differenceInDays(new Date(), item.process.createdAt)} días`,
  }));
};
