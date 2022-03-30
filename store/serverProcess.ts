import path from 'path'
import { Module, VuexModule, MutationAction, Mutation } from 'vuex-module-decorators'

import { diffPerSec } from '.'
import { IServerProcess, IServerProcessInfo } from '~/interface/serverProcess'
import { $axios } from '~/utils/axios'

export interface ServerProcessInfo {
  serverName: string
  processName: string
  processingTime: number
  threadId: number
  receiveTime: string
  alive: boolean
  aliveText: string
}

interface ProcessState {
  map: {[serverName: string]: ServerProcessInfo}
  list: ServerProcessInfo[]
}

interface ProcessDictionary {
  [hostName: string]: ProcessState
}

interface ServerProcessState {
  processDict: ProcessDictionary
}

@Module({
  name: 'serverProcess',
  namespaced: true
})
export default class ServerProcessStore extends VuexModule implements ServerProcessState {
  processDict: ProcessDictionary = {}

  get processByHost() {
    return (hostName: string): ServerProcessInfo[] => {
      return this.processDict[hostName]?.list ?? []
    }
  }

  @MutationAction
  async loadProcess() {
    const response = await $axios.get<IServerProcess[]>(`/api/process`)

    const processDict = response.data.reduce<ProcessDictionary>((accum, current) => {
      accum[current.hostName] = accum[current.hostName] || { map: {}, list: [] }

      const state = accum[current.hostName]
      if (!(current.serverName in state.map)) {
        state.map[current.serverName] = {
          serverName: current.serverName,
          processName: path.basename(current.processPath),
          processingTime: -1,
          threadId: -1,
          receiveTime: 'waiting...',
          alive: false,
          aliveText: 'waiting...'
        }

        state.list.push(state.map[current.serverName])
      }

      return accum
    }, {})

    return { processDict }
  }

  @Mutation
  onUpdate(serverInfo: IServerProcessInfo) {
    if (!(serverInfo.hostName in this.processDict)) {
      return
    }

    const host = this.processDict[serverInfo.hostName]
    if (!(serverInfo.serverName in host.map)) {
      return
    }

    const process = host.map[serverInfo.serverName]
    process.processingTime = serverInfo.processingTime
    process.threadId = serverInfo.threadId

    const diffSec = diffPerSec(new Date(serverInfo.lastReceiveTime), new Date())
    if (process.processingTime > 0) {
      process.receiveTime = `${diffSec} 초 전`
    }
    process.alive = serverInfo.alive
    process.aliveText = serverInfo.alive ? 'Running' : 'Dead'

    this.processDict = {...this.processDict}
  }
}
