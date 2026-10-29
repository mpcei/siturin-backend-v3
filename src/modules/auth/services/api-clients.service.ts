import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { ApiClientEntity } from '../entities/api-client.entity';
import { AuthRepositoryEnum } from '@utils/enums';

@Injectable()
export class ApiClientsService {
  constructor(
    @Inject(AuthRepositoryEnum.API_CLIENT_REPOSITORY)
    private readonly repository: Repository<ApiClientEntity>,
  ) {}

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  private generateKey() {
    const key = `mdep_${randomBytes(32).toString('hex')}`;

    return {
      key,
      keyPrefix: key.substring(0, 16),
      keyHash: this.hashKey(key),
    };
  }

  async create(name: string, description?: string, expiresAt?: Date) {
    const generated = this.generateKey();

    const client = this.repository.create({
      name,
      description: description ?? null,
      keyPrefix: generated.keyPrefix,
      keyHash: generated.keyHash,
      isActive: true,
      expiresAt: expiresAt ?? null,
    });

    const saved = await this.repository.save(client);

    // La clave original no se almacena en la base de datos.
    return {
      id: saved.id,
      name: saved.name,
      apiKey: generated.key,
      expiresAt: saved.expiresAt,
      message: 'Guarda esta clave de forma segura. No se volverá a mostrar.',
    };
  }

  async findAll() {
    const clients = await this.repository.find({
      order: { createdAt: 'DESC' },
    });

    // Nunca devolver el hash ni la clave original.
    return clients.map(({ keyHash, ...client }) => client);
  }

  async deactivate(id: string) {
    const client = await this.repository.findOneBy({ id });

    if (!client) {
      throw new NotFoundException('Cliente API no encontrado');
    }

    client.isActive = false;
    await this.repository.save(client);

    return {
      id: client.id,
      name: client.name,
      isActive: client.isActive,
      message: 'Acceso revocado',
    };
  }

  async rotateKey(id: string) {
    const client = await this.repository.findOneBy({ id });

    if (!client) {
      throw new NotFoundException('Cliente API no encontrado');
    }

    const generated = this.generateKey();

    client.keyPrefix = generated.keyPrefix;
    client.keyHash = generated.keyHash;
    client.isActive = true;

    await this.repository.save(client);

    return {
      id: client.id,
      name: client.name,
      apiKey: generated.key,
      message: 'Clave renovada. La clave anterior deja de funcionar.',
    };
  }
}
