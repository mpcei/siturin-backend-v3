import { IsArray, IsBoolean, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  isBooleanValidationOptions,
  isNotEmptyValidationOptions,
  isStringValidationOptions,
} from '@utils/dto-validation';
import { SecurityQuestionDto } from '@auth/dto/security-questions/security-question.dto';

export class SignUpExternalDto {
  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  username: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  email: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  identification: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  name: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  password: string;

  @IsBoolean(isBooleanValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  termsAcceptedAt: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SecurityQuestionDto)
  @IsNotEmpty(isNotEmptyValidationOptions())
  securityQuestions: SecurityQuestionDto[];
}
