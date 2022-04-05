import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators'

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


@Module({
  name: 'hostServer',
  namespaced: true
})
export default class HostServerStore extends VuexModule implements HostServerState {
  servers: HostServerInfo[] = []
  hostMap: {[key: string]: HostServerInfo} = {}

  get serverList() {
    return this.servers
  }

  get colorMonitoring() {
    return (hostName: string) => {
      return this.hostMap[hostName]?.monitoring ? 'green' : 'gray'
    }
  }

  get colorAliveAck() {
    return (hostName: string) => {
      return this.hostMap[hostName]?.alive ? 'green' : 'red'
    }
  }

  get isAliveHost() {
    return (hostName: string) => {
      return this.hostMap[hostName]?.alive ?? false
    }
  }

  @Mutation
  setServers(servers: HostServerInfo[]) {
    this.servers = servers
    for (const host of servers) {
      this.hostMap[host.hostName] = host
      host.aliveAckText = '끊김'
    }
  }

  @Mutation
  updateMonitoring(server?: HostServerInfo) {
    if (server === undefined) {
      return
    }

    const host = this.hostMap[server.hostName]
    host.monitoring = server.monitoring
    this.servers = [...this.servers]
  }

  @Mutation
  onAliveAck(hostServer: IHostServerInfo) {
    const host = this.hostMap[hostServer.hostName]
    host.monitoring = hostServer.monitoring
    host.aliveAckTime = new Date()
    this.servers = [...this.servers]
  }

  @Mutation
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

  @Action({ commit: 'setServers' })
  async loadServers() {
    const response = await $axios.get<IHostServer[]>(`/api/servers`)
    const servers = response.data.map<HostServerInfo>((value) => {
      return {
        hostName: value.hostName,
        ipAddr: value.ipAddr
      }
    })

    return servers
  }

  @Action({ commit: 'updateMonitoring' })
  async setMonitoring(request: IHostServerInfo) {
    const response = await $axios.put<IHostServerInfo>(`/api/servers/monitoring`, request)
    return response.data
  }


  @Action
  updateHostStatus() {
    for (const host of this.serverList) {
      this.onUpdateAliveAck(host)
    }
  }
}
