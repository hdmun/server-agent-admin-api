import { HttpService } from "@nestjs/axios"
import { Injectable } from "@nestjs/common"
import { firstValueFrom } from "rxjs"
import { HostStateDto, HostStateResponse, ServerMonitoringRequest, ServerMonitoringResponse } from "~/dto/monitoring"
import { ServerProcessKillRequest, ServerProcessKillResponse, ServerProcessState } from "~/dto/server"

@Injectable()
export class AgentRepository {
  private readonly port = '3032'

  constructor(
    private readonly httpService: HttpService
  ) { }

  async getHostState(address: string): Promise<HostStateDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<HostStateResponse>(`http://${address}:${this.port}/`))
      if (response.status === 200)
        return { monitoring: response.data.on, alive: true }
    }
    catch { }

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
    // `kill`을 없애고
    // 리소스 경로 추가한 다음에 delete 요청을 해야하나?
    const url = `http://${address}:${this.port}/process/kill`
    const response = await firstValueFrom(
      this.httpService.put<ServerProcessKillResponse>(url, dto))
    if (response.status === 201)
      return response.data

    return null
  }
}