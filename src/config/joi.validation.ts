import Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  APP_PORT: Joi.number().required(),
  APP_URL: Joi.string().required(),
  APP_NAME: Joi.string().required(),
  APP_SHORT_NAME: Joi.string().required(),
  APP_VERSION: Joi.string().required(),
  APP_ENV: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_EXPIRES: Joi.string().required(),
  JWT_REFRESH_EXPIRES: Joi.string().required(),

  MAX_ATTEMPTS: Joi.number().required(),
  SECURITY_CODE_EXPIRES_IN: Joi.number().required(),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.string().required(),
  MAIL_SECURE: Joi.boolean().required(),
  MAIL_USERNAME: Joi.string().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_FROM_ADDRESS: Joi.string().required(),
  MAIL_FROM_NAME: Joi.string().required(),

  MINIO_ENDPOINT: Joi.string().required(),
  MINIO_PORT: Joi.number().required(),
  MINIO_ACCESS_KEY: Joi.string().required(),
  MINIO_SECRET_KEY: Joi.string().required(),
  MINIO_BUCKET: Joi.string().required(),
  MINIO_PRESIGNED_EXPIRY: Joi.number().required(),

  URL_LDAP: Joi.string().required(),
  URL_DINARDAP: Joi.string().required(),
  URL_INTERNO: Joi.string().required(),
});
