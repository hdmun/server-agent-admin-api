import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators'

import { IHostServer, IHostServerInfo } from '~/interface/hostServer'
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


function diffInSec(before: Date, after: Date) {
  const diffInMs = Math.abs(after.getTime() - before.getTime());
  return Math.floor(diffInMs / 1000);
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

  @Mutation
  updateServers(servers: HostServerInfo[]) {
    this.servers = servers
    for (const host of servers) {
      this.hostMap[host.hostName] = host
      host.aliveAckText = '끊김'
    }
  }

  @Mutation
  onAliveAck(hostServer: IHostServerInfo) {
    const nowdt = new Date()
    const host = this.hostMap[hostServer.hostName]
    host.monitoring = hostServer.monitoring

    if (host.aliveAckTime === undefined) {
      host.alive = true
      host.aliveAckTime = nowdt
      this.servers = [...this.servers]
      return
    }

    const lastAcliveAckTime = host.aliveAckTime
    const diffSec = diffInSec(lastAcliveAckTime, nowdt)
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

  @Action({ commit: 'updateServers' })
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
}
