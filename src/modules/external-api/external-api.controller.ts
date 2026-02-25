import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import data from './data.json';
import { PublicRoute } from '@auth/decorators';

@ApiTags('External Apis Fake')
@Controller('external-apis')
export class ExternalApiController {
  @PublicRoute()
  @Get('sri/:ruc')
  sri(@Param('ruc') ruc: string): any {
    let rucData = data.sri.data.find((x) => x.ruc === ruc);

    if (!rucData)
      rucData = {
        ruc: '',
        razonSocial: '',
        actividadEconomicaPrincipal: '',
        tipoContribuyente: '',
        estadoContribuyente: '',
        fechaActualizacion: '',
        cedulaRepresentanteLegal: '',
        nombreRepresentanteLegal: '',
        establecimientos: [],
      };

    return {
      data: rucData,
      message: `Registros Consultados`,
      title: `Consultados`,
    };
  }

  @PublicRoute()
  @Get('supercias/:ruc')
  supercias(): any {
    return {
      data: data.supercias.data,
      message: `Registros Consultados`,
      title: `Consultados`,
    };
  }

  @PublicRoute()
  @Get('registro-civil/:cedula')
  registroCivil(): any {
    return {
      data: data.registroCivil.data,
      message: `Registros Consultados`,
      title: `Consultados`,
    };
  }

  @PublicRoute()
  @Get(':correo/:clave')
  ldap(): any {
    return {
      data: data.ldap.data,
      message: `Registros Consultados`,
      title: `Consultados`,
    };
  }
}
