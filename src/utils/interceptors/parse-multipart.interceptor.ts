import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

@Injectable()
export class ParseMultipartInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();

    if (req.body?.payload) {
      req.body.payload = JSON.parse(req.body.payload);
    }

    return next.handle();
  }
}
