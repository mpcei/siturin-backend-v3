import { Module } from '@nestjs/common';
import { BucketService } from './bucket.service';
import { S3Service } from '@modules/common/bucket/s3.service';

@Module({
  providers: [BucketService, S3Service],
  exports: [BucketService, S3Service],
})
export class BucketModule {}
