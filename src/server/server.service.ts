import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { AgentRepository } from '~/agent/agent.repository';
import { ServerProcessKillRequest, ServerProcessResponse } from '~/dto/server';
import { ServerProcessRepository } from './server.repository';

@Injectable()
export class ServerService {
  constructor(
    private readonly serverRepository: ServerProcessRepository,
    private readonly agentRepository: AgentRepository
  ) { }

  async getServers(): Promise<ServerProcessResponse[]> {
    const servers = await this.serverRepository.find({ relations: ['hostServer'] })
    return Promise.all<Promise<ServerProcessResponse>>(
      servers.map(async (server) => {
        try {
          const state = await this.agentRepository.getProcessState(server.hostServer.ipAddr, server.serverName)
          if (state) {
            return {
              hostName: server.hostName,
              serverName: server.serverName,
              processName: path.basename(server.binaryPath),
              threadId: state.threadId,
              processingTime: state.processingTime,
              receiveTime: state.receiveTime
            }
          }
        } catch (error) {
          return {
            hostName: server.hostName,
            serverName: server.serverName,
            processName: path.basename(server.binaryPath),
            threadId: 0,
            processingTime: 0,
            receiveTime: ''
          }
        }
      })
    )
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
