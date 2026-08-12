export const processesReport = (data: any) => {
  return data.processes.map((item) => ({
    'Número de certificado': item.registeredAt,
    Propietario: item.activityId,
  }));
};
