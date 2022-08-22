import { Injectable, Logger } from '@nestjs/common';
import { HostServer } from './entity/host-server.entity';
import { HostServerRepository } from './host.repository';
import { AgentRepository } from '~/agent/agent.repository';
import { ServerMonitoringRequest } from '~/dto/monitoring';

@Injectable()
export class HostService {
  private readonly logger = new Logger(HostService.name);

  constructor(
    private readonly hostRepository: HostServerRepository,
    private readonly agentRepository: AgentRepository
  ) { }

  async getHosts(): Promise<HostServer[]> {
    const hosts = await this.hostRepository.find()
    return Promise.all<Promise<HostServer>>(
      hosts.map(async (host) => {
        try {
          const hostState = await this.agentRepository.getHostState(host.ipAddr, host.hostName)
          host.monitoring = hostState.monitoring
          host.alive = hostState.alive
        }
        catch (error) {
          this.logger.error(`'getHostState' ${host.hostName} ${host.ipAddr}, ${error}`)
        }

        return host
      })
    )
  }

  async getHost(hostName: string): Promise<HostServer> {
    return this.hostRepository.findOneBy({ hostName })
  }

  async updateMonitoring(dto: ServerMonitoringRequest) {
    const hostServer = await this.getHost(dto.hostName)
    if (hostServer === null) {
      throw Error(`invalid HostName: ${dto.hostName}`)
    }

    try {
      return await this.agentRepository
        .updateMonitoring(hostServer.ipAddr, dto)
    }
    catch (error) {
      this.logger.error(`'updateMonitoring' ${dto.hostName} ${hostServer.ipAddr}, ${error}`)
    }
  }
}
