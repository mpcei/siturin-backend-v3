export const cadastresReport = (data: any) => {
  return data.map((item) => ({
    RUC: item.ruc,
    'Código de Establecimiento RUC': item.numberEstablishment,
    'Nombre Comercial': item.tradeName,
    'Número de Registro': item.registerNumber,
    'Fecha de Registro': item.registeredAt,
    'Actividad / Modalidad': item.activity,
    Clasificación: item.classification,
    Categoría: item.category,
    'Razón social (Propietario)': item.legalName,
    'Representante Legal': item.legalRepresentative,
    Provincia: item.province,
    Cantón: item.canton,
    Parroquia: item.parish,
    'Tipo de Parroquia': item.typeParish,
    Dirección: item.address,
    'Referencia de Dirección': item.referenceAddress,
    Teléfono: item.phone,
    'Correo Electrónico': item.email,
    'Dirección Web': item.webPage,
    'Estado Registro del Establecimiento': item.stateCadastre,
  }));
};
