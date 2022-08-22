import axios from 'axios'
import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { AgentRepository } from '~/agent/agent.repository';
import { ServerProcessKillRequest, ServerProcessResponse } from '~/dto/server';
import { ServerProcessRepository } from './server.repository';

@Injectable()
export class ServerService {
  private readonly logger = new Logger(ServerService.name);

  constructor(
    private readonly serverRepository: ServerProcessRepository,
    private readonly agentRepository: AgentRepository
  ) { }

  async getServers(): Promise<ServerProcessResponse[]> {
    const servers = await this.serverRepository.find({ relations: ['hostServer'] })
    return Promise.all<Promise<ServerProcessResponse>>(
      servers
        .filter((value) => value.hostServer !== null)
        .map(async (server) => {
          const process: ServerProcessResponse = {
            hostName: server.hostName,
            serverName: server.serverName,
            processName: path.basename(server.binaryPath),
            threadId: 0,
            processingTime: 0,
            receiveTime: ''
          }
          try {
            const state = await this.agentRepository.getProcessState(server.hostServer.ipAddr, server.hostName, server.serverName)
            if (state) {
              process.threadId = state.threadId
              process.processingTime = state.processingTime
              process.receiveTime = state.receiveTime
              return process
            }
          } catch (error) {
            if (!axios.isAxiosError(error)) {
              this.logger.error(error)
            }
          }

          return process
        })
    )
  }

  async getServer(hostName: string, serverName: string) {
    return await this.serverRepository.findOne({
      where: {
        serverName,
        hostName
      },
      relations: ['hostServer']
    })
  }

  async killServer(address: string, hostName: string, dto: ServerProcessKillRequest) {
    return await this.agentRepository.killServer(address, hostName, dto)
  }
}
