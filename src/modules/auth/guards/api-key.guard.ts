import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { createHash, timingSafeEqual } from 'crypto';
import { ApiClientEntity } from '../entities/api-client.entity';
import { AuthRepositoryEnum } from '@utils/enums';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @Inject(AuthRepositoryEnum.API_CLIENT_REPOSITORY)
    private readonly repository: Repository<ApiClientEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const receivedKey = request.headers['x-api-key'];

    if (typeof receivedKey !== 'string' || !/^mdep_[a-f0-9]{64}$/.test(receivedKey)) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const keyPrefix = receivedKey.substring(0, 16);

    const client = await this.repository.findOne({
      where: { keyPrefix },
    });

    if (!client || !client.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (client.expiresAt && client.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Credenciales vencidas');
    }

    const receivedHash = createHash('sha256').update(receivedKey).digest();

    const storedHash = Buffer.from(client.keyHash, 'hex');

    if (storedHash.length !== receivedHash.length || !timingSafeEqual(storedHash, receivedHash)) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    /*// Identidad disponible para auditoría en otros componentes.
    request.apiClient = {
      id: client.id,
      name: client.name,
    };*/

    // Actualiza el último uso registrado.
    await this.repository.update(client.id, {
      lastUsedAt: new Date(),
    });

    return true;
  }
}
