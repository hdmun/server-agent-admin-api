import * as http from "http"
import { HttpService } from "@nestjs/axios"
import { Injectable, Logger } from "@nestjs/common"
import { firstValueFrom } from "rxjs"
import { HostStateDto, HostStateResponse, ServerMonitoringRequest, ServerMonitoringResponse } from "~/dto/monitoring"
import { ServerProcessKillRequest, ServerProcessKillResponse, ServerProcessState } from "~/dto/server"

@Injectable()
export class AgentRepository {
  private readonly port = '3032'
  private readonly logger = new Logger(AgentRepository.name);
  private readonly httpAgent = new http.Agent({ keepAlive: true })

  constructor(
    private readonly httpService: HttpService
  ) { }

  async getHostState(address: string, hostName: string): Promise<HostStateDto> {

    const response = await firstValueFrom(
      this.httpService.get<HostStateResponse>(`http://${address}:${this.port}/host`, {
        httpAgent: this.httpAgent,
        timeout: 5000,
        headers: {
          'hostname': hostName
        }
      }))
    if (response.status !== 200) {
      this.logger.error(`failed to request 'getHostState' ${response.status}`)
      return { monitoring: false, alive: false }
    }
    return { monitoring: response.data.on, alive: true }
  }

  async getProcessState(address: string, hostName: string, serverName: string) {
    const url = `http://${address}:${this.port}/process/${serverName}`
    const response = await firstValueFrom(
      this.httpService.get<ServerProcessState>(url, {
        httpAgent: this.httpAgent,
        timeout: 5000,
        headers: {
          'hostname': hostName
        }
      }))
    if (response.status === 200)
      return response.data
    return null
  }

  async updateMonitoring(address: string, dto: ServerMonitoringRequest) {
    const url = `http://${address}:${this.port}/monitoring`
    const response = await firstValueFrom(
      this.httpService.patch<ServerMonitoringResponse>(url, dto, {
        httpAgent: this.httpAgent,
        headers: {
          'hostname': dto.hostName
        }
      }))
    if (response.status === 201)
      return response.data

    return null
  }

  async killServer(address: string, hostName: string, dto: ServerProcessKillRequest) {
    const url = `http://${address}:${this.port}/process/${dto.serverName}/${dto.killCommand}`
    const response = await firstValueFrom(
      this.httpService.delete<ServerProcessKillResponse>(url, {
        httpAgent: this.httpAgent,
        headers: {
          'hostname': hostName
        }
      }))
    if (response.status === 200)
      return response.data

    return null
  }
}