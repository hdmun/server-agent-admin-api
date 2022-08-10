import { Injectable } from '@nestjs/common';
import { HostServer } from './entity/host-server.entity';
import { HostServerRepository } from './host.repository';
import { AgentRepository } from '~/agent/agent.repository';
import { ServerMonitoringRequest } from '~/dto/monitoring';

@Injectable()
export class HostService {
  constructor(
    private readonly hostRepository: HostServerRepository,
    private readonly agentRepository: AgentRepository
  ) { }

  async getHosts(): Promise<HostServer[]> {
    return this.hostRepository.find()
  }

  async getHost(hostName: string): Promise<HostServer> {
    return this.hostRepository.findOneBy({ hostName })
  }

  async updateMonitoring(dto: ServerMonitoringRequest) {
    const hostServer = await this.getHost(dto.hostName)
    if (hostServer === null) {
      throw Error(`invalid HostName: ${dto.hostName}`)
    }

    return await this.agentRepository
      .updateMonitoring(hostServer.ipAddr, dto)
  }
}
