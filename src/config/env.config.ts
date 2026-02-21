import { registerAs } from '@nestjs/config';
import * as process from 'node:process';
import { StringValue } from 'ms';

export const envConfig = registerAs('envConfig', () => {
  return {
    app: {
      port: parseInt(process.env.PORT!, 10),
      url: process.env.APP_URL,
      name: process.env.APP_NAME,
      shortName: process.env.APP_SHORT_NAME,
      version: process.env.APP_VERSION,
      env: process.env.ENV,
    },

    jwt: {
      secret: process.env.JWT_SECRET,
      expires: process.env.JWT_EXPIRES as StringValue,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      refreshExpires: process.env.JWT_REFRESH_EXPIRES as StringValue,
    },

    database: {
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT!, 10),
      username: process.env.DB_USER,
    },

    mail: {
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT!, 10),
      secure: process.env.MAIL_SECURE,
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
      from: process.env.MAIL_FROM_ADDRESS,
      fromName: process.env.MAIL_FROM_NAME,
    },

    maxAttempts: parseInt(process.env.MAX_ATTEMPTS!, 10),
    securityCodeExpiresIn: parseInt(process.env.SECURITY_CODE_EXPIRES_IN!, 10),

    bucket: {
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT!, 10),
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
      name: process.env.MINIO_BUCKET,
      presignedExpiry: parseInt(process.env.MINIO_PRESIGNED_EXPIRY!, 10),
    },

    externalApis: {
      urlLDAP: process.env.URL_LDAP,
      urlDinardap: process.env.URL_DINARDAP,
      urlInterno: process.env.URL_INTERNO,
    },
  };
});
