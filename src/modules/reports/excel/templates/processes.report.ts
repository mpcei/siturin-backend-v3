export const processesReport = (data: any) => {
  return data.map((item) => ({
    'Número de certificado': item.registeredAt,
    Propietario: item.activityId,
  }));
};
