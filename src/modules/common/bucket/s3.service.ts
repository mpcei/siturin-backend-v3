import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { envConfig } from '@config';
import { ConfigType } from '@nestjs/config';

export interface UploadFileParams {
  filePath: string;
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class S3Service implements OnModuleInit {
  private s3: S3Client;

  constructor(
    @Inject(envConfig.KEY)
    private configService: ConfigType<typeof envConfig>,
  ) {}

  async onModuleInit() {
    this.s3 = new S3Client({
      endpoint: `${this.configService.bucket.endPoint}:${this.configService.bucket.port}`,
      region: this.configService.bucket.region!,
      credentials: {
        accessKeyId: this.configService.bucket.accessKey!,
        secretAccessKey: this.configService.bucket.secretKey!,
      },
      forcePathStyle: true,
    });

    await this.ensureBucket(this.configService.bucket.name!);
  }

  async ensureBucket(bucket: string) {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch (error: any) {
      await this.s3.send(new CreateBucketCommand({ Bucket: bucket }));
    }
  }

  async uploadFile({ filePath, buffer, mimetype }: UploadFileParams) {
    const command = new PutObjectCommand({
      Bucket: this.configService.bucket.name,
      Key: filePath,
      Body: buffer,
      ContentType: mimetype,
    });

    return await this.s3.send(command);
  }

  async deleteFile(bucket: string, key: string) {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return this.s3.send(command);
  }

  async getObject(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.configService.bucket.name,
      Key: key,
    });

    return (await this.s3.send(command)).Body as any;
  }

  async generatePresignedUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.configService.bucket.name,
      Key: key,
    });

    return await getSignedUrl(this.s3, command, {
      expiresIn: 60 * this.configService.bucket.presignedExpiry,
    });
  }
}
