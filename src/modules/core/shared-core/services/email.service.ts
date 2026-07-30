import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { AuthRepositoryEnum, MailSubjectEnum } from '@utils/enums';
import { CoreRepositoryEnum, MailTemplateEnum } from '@modules/core/utils/enums';
import {
  AssignmentEntity,
  CadastreEntity,
  InternalUserEntity,
  ProcessEntity,
} from '@modules/core/entities';
import { UserEntity } from '@auth/entities';
import { MailService } from '@modules/common/mail/mail.service';
import { MailDataInterface } from '@modules/common/mail/interfaces/mail-data.interface';
import { InternalPdfService } from '@modules/reports/pdf/internal-pdf.service';
import { ExternalPdfService } from '@modules/reports/pdf/external-pdf.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailService: MailService,
    @Inject(CoreRepositoryEnum.PROCESS_REPOSITORY)
    private readonly processRepository: Repository<ProcessEntity>,
    @Inject(AuthRepositoryEnum.USER_REPOSITORY)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(CoreRepositoryEnum.CADASTRE_REPOSITORY)
    private readonly cadastreRepository: Repository<CadastreEntity>,
    @Inject(CoreRepositoryEnum.INTERNAL_USER_REPOSITORY)
    private readonly internalUserRepository: Repository<InternalUserEntity>,
    private readonly internalPdfService: InternalPdfService,
    private readonly externalPdfService: ExternalPdfService,
  ) {}

  async sendRegistrationCertificateEmail(cadastre: CadastreEntity) {
    // Cargar el proceso y lanzar NotFoundException si no existe
    const process = await this.processRepository.findOne({
      where: { id: cadastre.processId },
      relations: {
        establishment: { ruc: true },
        establishmentAddress: true,
        establishmentContactPerson: true,
      },
    });
    if (!process) {
      throw new NotFoundException('Trámite no encontrado');
    }

    const user = await this.userRepository.findOneBy({
      identification: process.establishment.ruc.number,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Preparar los datos del correo
    const data = {
      ruc: process.establishment.ruc.number,
      registerNumber: cadastre.registerNumber,
    };

    // Validar correos usando un método reutilizable
    const { validRecipients, invalidRecipients } = this.extractValidEmails([
      user.email,
      process.establishmentContactPerson.email,
    ]);

    if (validRecipients.length === 0) {
      return {
        title: 'No se pudo entregar a ningún correo válid',
        message: invalidRecipients,
      };
    }

    // Generar el PDF y enviar el correo
    const pdf = (await this.internalPdfService.generateRegistrationCertificate({
      cadastreId: cadastre.id,
    })) as Buffer;

    const mailData: MailDataInterface = {
      to: validRecipients,
      data,
      subject: `Registro de Turismo ${cadastre.registerNumber}`,
      template: MailTemplateEnum.INTERNAL_REGISTRATION_CERTIFICATE,
      attachments: [{ file: pdf, filename: `${cadastre.registerNumber}.pdf` }],
    };

    await this.mailService.sendMail(mailData);

    // Manejar posibles correos fallidos
    if (invalidRecipients.length > 0) {
      return {
        title: 'No se pudo entregar a los siguientes correos',
        message: invalidRecipients,
      };
    }
  }

  async sendProcessRegistrationEmail(processId: string, manager: EntityManager) {
    // Cargar el proceso y lanzar NotFoundException si no existe
    console.log(processId);
    const processRepository = manager.getRepository(ProcessEntity);
    const process = await processRepository.findOne({
      where: { id: processId },
      relations: {
        establishment: {
          ruc: true,
          province: true,
          canton: true,
          parish: true,
          credentials: { classification: true },
        },
        activity: true,
        type: true,
        establishmentAddress: true,
        establishmentContactPerson: true,
        credentials: { classification: true },
      },
    });

    console.log(process);
    if (!process) {
      throw new NotFoundException('Trámite no encontrado');
    }

    const user = await this.userRepository.findOneBy({
      identification: process.establishment.ruc.number,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let classifications = process.credentials
      .map((item) => item.classification?.name)
      .filter(Boolean)
      .join(', ');

    if (!classifications) {
      classifications = process.establishment.credentials
        .map((item) => item.classification?.name)
        .filter(Boolean)
        .join(', ');
    }

    // Preparar los datos del correo
    const data = {
      user,
      process,
      establishment: process.establishment,
      classifications,
    };

    // Validar correos usando un método reutilizable
    const { validRecipients, invalidRecipients } = this.extractValidEmails([
      user.email,
      process.establishmentContactPerson.email,
    ]);

    if (validRecipients.length === 0) {
      return {
        title: 'No se pudo entregar a ningún correo válid',
        message: invalidRecipients,
      };
    }

    const mailData: MailDataInterface = {
      to: validRecipients,
      subject: MailSubjectEnum.EMAIL_PROCESS_REGISTRATION,
      template: MailTemplateEnum.PROCESS_REGISTRATION,
      data,
    };

    await this.mailService.sendMail(mailData);

    // Manejar posibles correos fallidos
    if (invalidRecipients.length > 0) {
      return {
        title: 'No se pudo entregar a los siguientes correos',
        message: invalidRecipients,
      };
    }
  }

  async sendProcessInactivationEmail(cadastre: CadastreEntity) {
    // Cargar el proceso y lanzar NotFoundException si no existe

    const process = await this.processRepository.findOne({
      where: { id: cadastre.processId },
      relations: {
        establishment: {
          ruc: true,
          province: true,
          canton: true,
          parish: true,
          establishmentContactPerson: true,
        },
        type: true,
        activity: true,
        credentials: { classification: true },
      },
    });

    if (!process) {
      throw new NotFoundException('Trámite no encontrado');
    }

    const user = await this.userRepository.findOneBy({
      identification: process.establishment.ruc.number,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Preparar los datos del correo
    const data = {
      user,
      process,
      establishment: process.establishment,
      classifications: process.credentials.map((item) => item.classification.name).join(', '),
    };

    // Validar correos usando un método reutilizable
    const { validRecipients, invalidRecipients } = this.extractValidEmails([
      user.email,
      process.establishment.establishmentContactPerson.email,
    ]);

    if (validRecipients.length === 0) {
      return {
        title: 'No se pudo entregar a ningún correo válid',
        message: invalidRecipients,
      };
    }

    // Generar el PDF y enviar el correo
    const pdf = (await this.externalPdfService.generateInactivation({
      cadastreId: cadastre.id,
    })) as Buffer;

    // console.log('pdf', pdf);

    const mailData: MailDataInterface = {
      to: validRecipients,
      subject: MailSubjectEnum.EMAIL_PROCESS_INACTIVATION,
      template: MailTemplateEnum.PROCESS_INACTIVATION,
      attachments: [{ file: pdf, filename: `${cadastre.registerNumber}.pdf` }],
      data,
    };

    await this.mailService.sendMail(mailData);

    // Manejar posibles correos fallidos
    if (invalidRecipients.length > 0) {
      return {
        title: 'No se pudo entregar a los siguientes correos',
        message: invalidRecipients,
      };
    }
  }

  async sendDirectorReviewedEmail(process: ProcessEntity, assignment: AssignmentEntity) {
    const internalUser = await this.internalUserRepository.findOne({
      where: { id: assignment.internalUserId },
      relations: { user: true },
    });

    if (!internalUser) {
      throw new NotFoundException('Usuario Interno no encontrado');
    }

    // Preparar los datos del correo
    const data = {
      user: internalUser.user,
      processType: process.type,
    };

    // Validar correos usando un metodo reutilizable
    const { validRecipients, invalidRecipients } = this.extractValidEmails([
      internalUser.user.email,
    ]);

    if (validRecipients.length === 0) {
      return {
        title: 'No se pudo entregar a ningún correo válid',
        message: invalidRecipients,
      };
    }

    const mailData: MailDataInterface = {
      to: validRecipients,
      subject: MailSubjectEnum.EMAIL_PROCESS_IN_APPROVAL,
      template: MailTemplateEnum.PROCESS_IN_APPROVAL,
      data,
    };

    await this.mailService.sendMail(mailData);

    // Manejar posibles correos fallidos
    if (invalidRecipients.length > 0) {
      return {
        title: 'No se pudo entregar a los siguientes correos',
        message: invalidRecipients,
      };
    }
  }

  async sendExternalDocumentRejectedEmail(user: UserEntity, observation: string) {
    const externalUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!externalUser) {
      throw new NotFoundException('Usuario externo no encontrado');
    }

    // Preparar los datos del correo
    const data = {
      user: externalUser,
      observation,
    };

    // Validar correos usando un metodo reutilizable
    const { validRecipients, invalidRecipients } = this.extractValidEmails([user.email]);

    if (validRecipients.length === 0) {
      return {
        title: 'No se pudo entregar a ningún correo válid',
        message: invalidRecipients,
      };
    }

    const mailData: MailDataInterface = {
      to: validRecipients,
      subject: MailSubjectEnum.EMAIL_PROCESS_DOCUMENT_REJECTED,
      template: MailTemplateEnum.PROCESS_DOCUMENT_REJECTED,
      data,
    };

    await this.mailService.sendMail(mailData);

    // Manejar posibles correos fallidos
    if (invalidRecipients.length > 0) {
      return {
        title: 'No se pudo entregar a los siguientes correos',
        message: invalidRecipients,
      };
    }
  }

  async sendExternalResultEmail(user: UserEntity, process: ProcessEntity, observation: string) {
    const userExternal = await this.userRepository.findOne({
      where: { id: user.id },
    });

    const cadastreEstablishment = await this.cadastreRepository
      .createQueryBuilder('cadastres')
      .innerJoin('cadastres.process', 'process')
      .innerJoin('process.establishment', 'establishment')
      .where('establishment.id = :id', { id: process.establishment.id })
      .getOne();

    if (!userExternal || !cadastreEstablishment) {
      throw new NotFoundException('Usuario o Catastro no encontrado');
    }

    // Preparar los datos del correo
    const data = {
      user: userExternal,
      process: process,
      classifications: process.credentials.map((item) => item.classification.name).join(', '),
      registerNumber: cadastreEstablishment.registerNumber,
      registeredAt: cadastreEstablishment.registeredAt,
      observation,
    };

    // Validar correos usando un metodo reutilizable
    const { validRecipients, invalidRecipients } = this.extractValidEmails([
      user.email,
      process.establishment.establishmentContactPerson.email,
    ]);

    if (validRecipients.length === 0) {
      return {
        title: 'No se pudo entregar a ningún correo válid',
        message: invalidRecipients,
      };
    }

    // Generar el PDF y enviar el correo
    const pdf = (await this.internalPdfService.generateRegistrationCertificateGuide({
      cadastreId: cadastreEstablishment.id,
    })) as Buffer;

    const mailData: MailDataInterface = {
      to: validRecipients,
      subject: MailSubjectEnum.EMAIL_PROCESS_RESULT,
      template: MailTemplateEnum.PROCESS_RESULT,
      attachments: [{ file: pdf, filename: `${cadastreEstablishment.registerNumber}.pdf` }],
      data,
    };

    await this.mailService.sendMail(mailData);

    // Manejar posibles correos fallidos
    if (invalidRecipients.length > 0) {
      return {
        title: 'No se pudo entregar a los siguientes correos',
        message: invalidRecipients,
      };
    }
  }

  /**
   * Valida y separa correos electrónicos válidos e inválidos.
   */
  private extractValidEmails(emails: string[]): {
    validRecipients: string[];
    invalidRecipients: string[];
  } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRecipients: string[] = [];
    const invalidRecipients: string[] = [];

    emails.forEach((email) => {
      if (email != null && email != '') {
        if (emailRegex.test(email)) {
          validRecipients.push(email);
        } else {
          invalidRecipients.push(email);
        }
      }
    });

    return { validRecipients, invalidRecipients };
  }
}
