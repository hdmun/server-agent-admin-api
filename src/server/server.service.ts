import { Injectable } from '@nestjs/common';
import { AgentRepository } from '~/agent/agent.repository';
import { ServerProcessKillRequest } from '~/dto/server';
import { ServerProcess } from './entity/server-process.entity';
import { ServerProcessRepository } from './server.repository';

@Injectable()
export class ServerService {
  constructor(
    private readonly serverRepository: ServerProcessRepository,
    private readonly agentRepository: AgentRepository
  ) { }

  async getServers(): Promise<ServerProcess[]> {
    return this.serverRepository.find()
  }

  async getServer(hostName: string, serverName: string) {
    return await this.serverRepository.findOneBy({
      hostName,
      serverName
    })
  }

  async deleteServer(address: string, dto: ServerProcessKillRequest) {
    return await this.agentRepository.killServer(address, dto)
  }
}
