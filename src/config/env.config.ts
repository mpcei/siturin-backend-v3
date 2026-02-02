import { registerAs } from '@nestjs/config';
import * as process from 'node:process';
import { StringValue } from 'ms';

export const envConfig = registerAs('envConfig', () => {
  return {
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
    apiKey: process.env.API_KEY,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpires: process.env.JWT_EXPIRES as StringValue,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES as StringValue,
    port: parseInt(process.env.PORT!, 10),
    appUrl: process.env.APP_URL,
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    appVersion: process.env.APP_VERSION,
    env: process.env.ENV,
    urlLDAP: process.env.URL_LDAP,
    urlDinardap: process.env.URL_DINARDAP,
    maxAttempts: parseInt(process.env.MAX_ATTEMPTS!, 10),
    securityCodeExpiresIn: parseInt(process.env.SECURITY_CODE_EXPIRES_IN!, 10),
  };
});
