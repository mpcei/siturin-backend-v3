import { Inject, Injectable } from '@nestjs/common';
import { join } from 'path';
import { envConfig } from '@config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class FolderPathsService {
  constructor(@Inject(envConfig.KEY) private configService: ConfigType<typeof envConfig>) {}

  get mailTemporaryFiles(): string {
    if (this.configService.env !== 'production') {
      return join(process.cwd(), 'src/modules/common/mail/temporary-files');
    }

    return join(__dirname, 'temporary-files');
  }

  get mailImages(): string {
    if (this.configService.env !== 'production') {
      return join(process.cwd(), 'src/modules/common/mail/images');
    }

    return join(__dirname, 'templates');
  }

  get mailTemplates(): string {
    if (this.configService.env !== 'production') {
      return join(process.cwd(), 'src/modules/common/mail/templates');
    }

    return join(__dirname, 'templates');
  }

  get avatars(): string {
    if (this.configService.env !== 'production') {
      return join(process.cwd(), 'src/modules/common/mail/templates');
    }

    return join(__dirname, 'templates');
  }
}
