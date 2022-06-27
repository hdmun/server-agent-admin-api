import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HostServer } from './entity/host-server.entity';

@Injectable()
export class HostService {
  constructor(
    @InjectRepository(HostServer)
    private readonly hostRepository: Repository<HostServer>
  ) {}

  async getHosts(): Promise<HostServer[]> {
    return this.hostRepository.find()
  }
}
