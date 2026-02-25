import { Global, Module } from '@nestjs/common';
import { ExternalApiController } from '@modules/external-api/external-api.controller';

@Global()
@Module({
  imports: [],
  providers: [],
  controllers: [ExternalApiController],
})
export class ExternalApiModule {}
