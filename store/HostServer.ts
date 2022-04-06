import { createModule, getter, mutation, action } from 'vuex-class-component'

import { diffPerSec } from '.'
import { IHostServer, IHostServerInfo } from '~/interface/HostServer'
import { $axios } from '~/utils/axios'

export interface HostServerInfo extends IHostServer {
  monitoring?: boolean
  alive?: boolean
  aliveAckTime?: Date
  aliveAckText?: string
}

interface HostServerState {
  servers: HostServerInfo[]
  hostMap: {[key: string]: HostServerInfo}
}

const VuexModule = createModule({
  namespaced: 'HostServer',
  strict: false,
  target: 'nuxt',
})
export default class HostServerStore extends VuexModule implements HostServerState {
  servers: HostServerInfo[] = []
  hostMap: {[key: string]: HostServerInfo} = {}

  @getter serverList() {
    return this.servers
  }

  @getter colorMonitoring(hostName: string) {
    return this.hostMap[hostName]?.monitoring ? 'green' : 'gray'
  }

  @getter colorAliveAck(hostName: string) {
    return this.hostMap[hostName]?.alive ? 'green' : 'red'
  }

  @getter isAliveHost(hostName: string) {
    return this.hostMap[hostName]?.alive ?? false
  }

  @mutation
  setServers(servers: HostServerInfo[]) {
    this.servers = servers
    for (const host of servers) {
      this.hostMap[host.hostName] = host
      host.aliveAckText = '끊김'
    }
  }

  @mutation
  updateMonitoring(server?: HostServerInfo) {
    if (server === undefined) {
      return
    }

    const host = this.hostMap[server.hostName]
    host.monitoring = server.monitoring
    this.servers = [...this.servers]
  }

  @mutation
  onAliveAck(hostServer: IHostServerInfo) {
    const host = this.hostMap[hostServer.hostName]
    host.monitoring = hostServer.monitoring
    host.aliveAckTime = new Date()
    this.servers = [...this.servers]
  }

  @mutation
  onUpdateAliveAck(host: HostServerInfo) {
    if (host.aliveAckTime === undefined) {
      return
    }

    const nowdt = new Date()
    const diffSec = diffPerSec(host.aliveAckTime, nowdt)
    if (diffSec > 1) {
      host.alive = false
      host.aliveAckText = `${diffSec} 초 지연`
    }
    else {
      host.alive = true
      host.aliveAckText = '연결 중'
    }

    host.aliveAckTime = nowdt

    this.servers = [...this.servers]
  }

  @action
  async loadServers() {
    const response = await $axios.get<IHostServer[]>(`/api/servers`)
    this.servers = response.data.map<HostServerInfo>((value) => {
      return {
        hostName: value.hostName,
        ipAddr: value.ipAddr
      }
    })
  }

  @action
  async setMonitoring(request: IHostServerInfo) {
    const response = await $axios.put<IHostServerInfo>(`/api/servers/monitoring`, request)
    return response.data
  }


  @action
  async updateHostStatus() {
    for (const host of this.serverList()) {
      this.onUpdateAliveAck(host)
    }
  }
}
