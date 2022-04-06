import path from 'path'
import { createModule, getter, mutation, action } from 'vuex-class-component'

import { diffPerSec } from '.'
import { IRequestProcessKill, IResponseProcessKill, IServerProcess, IServerProcessInfo } from '~/interface/ServerProcess'
import { $axios } from '~/utils/axios'

export interface ServerProcessInfo {
  hostName: string
  serverName: string
  processName: string
  processingTime: number
  threadId: number
  receiveTime: string
  alive: boolean
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
  listAll: ServerProcessInfo[]
}

const VuexModule = createModule({
  namespaced: 'SeverProcess',
  strict: false,
  target: 'nuxt',
})
export default class ServerProcessStore extends VuexModule implements ServerProcessState {
  processDict: ProcessDictionary = {}
  listAll: ServerProcessInfo[] = []

  get processByHost() {
    return (hostName: string): ServerProcessInfo[] => {
      return this.processDict[hostName]?.list ?? []
    }
  }

  get processAll() {
    return this.listAll
  }

  @action
  async loadProcess() {
    const response = await $axios.get<IServerProcess[]>(`/api/process`)

    const processDict = response.data.reduce<ProcessDictionary>((accum, current) => {
      accum[current.hostName] = accum[current.hostName] || { map: {}, list: [] }

      const state = accum[current.hostName]
      if (!(current.serverName in state.map)) {
        state.map[current.serverName] = {
          hostName: current.hostName,
          serverName: current.serverName,
          processName: path.basename(current.processPath),
          processingTime: -1,
          threadId: -1,
          receiveTime: 'waiting...',
          alive: false,
        }

        state.list.push(state.map[current.serverName])
      }

      return accum
    }, {})

    const listAll = Object.keys(processDict)
      .map(key => {
        return processDict[key].list
      })
      .flatMap(value => value)

    this.processDict = {...this.processDict}
    this.listAll = [...this.listAll]
  }

  @mutation
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

    this.processDict = {...this.processDict}
  }

  @action
  async killCommand(request: IRequestProcessKill) {
    await $axios.put<IResponseProcessKill[]>(`/api/process/kill`, request)
    // 응답 받은 데이터로 상태를 바로 변경해주는게 나을까?
  }
}
