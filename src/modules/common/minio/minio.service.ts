import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigType } from '@nestjs/config';
import { envConfig } from '@config';

export interface UploadFileParams {
  filePath: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
}

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client;
  constructor(
    @Inject(envConfig.KEY)
    private configService: ConfigType<typeof envConfig>,
  ) {}

  async onModuleInit() {
    this.client = new Minio.Client({
      endPoint: this.configService.bucket.endPoint!,
      port: Number(this.configService.bucket.port),
      useSSL: false,
      accessKey: this.configService.bucket.accessKey,
      secretKey: this.configService.bucket.secretKey,
    });

    await this.ensureBucket();
  }

  async ensureBucket() {
    const exists = await this.client.bucketExists(this.configService.bucket.name!);
    if (!exists) {
      await this.client.makeBucket(this.configService.bucket.name!);
    }
  }

  async uploadFile({ filePath, buffer, size, mimetype }: UploadFileParams) {
    await this.client.putObject(this.configService.bucket.name!, filePath, buffer, size, {
      'Content-Type': mimetype,
    });

    return filePath;
  }

  async uploadFiles(files: Express.Multer.File[], userId: number) {
    return Promise.all(
      files.map(async (file) => {
        const fileName = `${userId}/${Date.now()}-${file.originalname}`;

        await this.client.putObject(
          this.configService.bucket.name!,
          fileName,
          file.buffer,
          file.size,
          {
            'Content-Type': file.mimetype,
          },
        );

        return {
          originalName: file.originalname,
          fileName,
          size: file.size,
        };
      }),
    );
  }

  async generatePresignedUrl(fileName: string) {
    return this.client.presignedGetObject(
      this.configService.bucket.name!,
      fileName,
      60 * this.configService.bucket.presignedExpiry,
    );
  }

  async getObject(objectKey: string) {
    return this.client.getObject(this.configService.bucket.name!, objectKey);
  }
}
