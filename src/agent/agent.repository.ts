import axios from "axios"
import { HttpService } from "@nestjs/axios"
import { Injectable, Logger } from "@nestjs/common"
import { firstValueFrom } from "rxjs"
import { HostStateDto, HostStateResponse, ServerMonitoringRequest, ServerMonitoringResponse } from "~/dto/monitoring"
import { ServerProcessKillRequest, ServerProcessKillResponse, ServerProcessState } from "~/dto/server"

@Injectable()
export class AgentRepository {
  private readonly port = '3032'
  private readonly logger = new Logger(AgentRepository.name);

  constructor(
    private readonly httpService: HttpService
  ) { }

  async getHostState(address: string): Promise<HostStateDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<HostStateResponse>(`http://${address}:${this.port}/`))
      if (response.status === 200)
      if (response.status === 200) {
        return { monitoring: response.data.on, alive: true }
      }
      this.logger.error(`failed to request 'getHostState' ${response.headers}`)
    }
    catch (error) {
      if (axios.isAxiosError(error)) {
        const response = error.response
        this.logger.error(`exception to request 'getHostState' ${error}`, response.headers)
      } else {
        this.logger.error(error)
      }
    }

    return { monitoring: false, alive: false }
  }

  async getProcessState(address: string, serverName: string) {
    const url = `http://${address}:${this.port}/process/${serverName}`
    const response = await firstValueFrom(
      this.httpService.get<ServerProcessState>(url))
    if (response.status === 200)
      return response.data

    return null
  }

  async updateMonitoring(address: string, dto: ServerMonitoringRequest) {
    const url = `http://${address}:${this.port}/monitoring`
    const response = await firstValueFrom(
      this.httpService.patch<ServerMonitoringResponse>(url, dto))
    if (response.status === 201)
      return response.data

    return null
  }

  async killServer(address: string, dto: ServerProcessKillRequest) {
    const url = `http://${address}:${this.port}/process/${dto.serverName}/${dto.killCommand}`
    const response = await firstValueFrom(
      this.httpService.delete<ServerProcessKillResponse>(url))
    if (response.status === 200)
      return response.data

    return null
  }
}