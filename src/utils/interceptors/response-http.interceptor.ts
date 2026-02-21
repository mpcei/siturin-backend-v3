import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ServiceUnavailableException,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { envConfig } from '@config';
import { ConfigType } from '@nestjs/config';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseHttpInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(
    @Inject(envConfig.KEY)
    private readonly configService: ConfigType<typeof envConfig>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    if (false) {
      throw new ServiceUnavailableException();
    }

    const httpResponse = context.switchToHttp().getResponse();

    const contentType = httpResponse.getHeader('Content-Type');

    if (contentType && contentType.includes('application/pdf')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((responseData) => {
        if (!responseData || httpResponse.headersSent) {
          return responseData;
        }

        return {
          data: responseData.data,
          pagination: responseData.pagination,
          message: responseData.message,
          title: responseData.title,
          version: this.configService.app.version,
        };
      }),
    );
  }
}
