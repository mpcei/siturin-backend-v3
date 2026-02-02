import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ErrorResponseHttpModel } from '../interfaces';
import { ThrottlerException } from '@nestjs/throttler';
import { MailSendException } from '@utils/exceptions/MailSendException';
import { ErrorCodeEnum } from '@auth/enums';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponseHttpModel: ErrorResponseHttpModel = {
      error: ErrorCodeEnum.SERVER_ERROR,
      message: 'Unexpected error occurred',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const { message, error, data } = exception.getResponse() as ErrorResponseHttpModel;

      if (data) errorResponseHttpModel.data = data;

      errorResponseHttpModel.error = error;
      errorResponseHttpModel.message = message;

      if (exception instanceof BadRequestException) {
        errorResponseHttpModel.message = message;
      }

      if (exception instanceof UnprocessableEntityException) {
        errorResponseHttpModel.error = ErrorCodeEnum.UNPROCESSABLE_ENTITY;
        errorResponseHttpModel.message = message;
      }

      if (exception instanceof UnauthorizedException) {
        errorResponseHttpModel.message = message ?? 'Credenciales no válidas';
      }

      if (exception instanceof NotFoundException) {
        errorResponseHttpModel.message = message;
      }

      if (exception instanceof ForbiddenException) {
        errorResponseHttpModel.message = message;
      }

      if (exception instanceof ThrottlerException) {
        errorResponseHttpModel.data = null;
        errorResponseHttpModel.message =
          'Has superado el límite de solicitudes permitidas. Por favor, espera un momento antes de intentarlo nuevamente.';
      }

      if (exception instanceof ServiceUnavailableException) {
        errorResponseHttpModel.data = {
          startedAt: '2023-08-25',
          endedAt: '2023-08-31',
        };

        errorResponseHttpModel.message =
          'El sistema se encuentra en mantenimiento, lamentamos las molestias causadas';
      }

      return response.status(status).json(errorResponseHttpModel);
    }

    if (exception instanceof QueryFailedError) {
      status = 400;
      errorResponseHttpModel.message = exception?.driverError?.detail || 'Query Error';

      return response.status(status).json(errorResponseHttpModel);
    }

    if (exception instanceof MailSendException) {
      status = exception.getStatus();
      const { message } = exception.getResponse() as ErrorResponseHttpModel;

      errorResponseHttpModel.message = message || exception.message || 'Error';

      return response.status(status).json(errorResponseHttpModel);
    }

    if (exception instanceof Error && status === 500) {
      errorResponseHttpModel.error = exception.name || 'Error';
      errorResponseHttpModel.message = exception.message || 'Error';
    }

    response.status(status).json(errorResponseHttpModel);
  }
}
