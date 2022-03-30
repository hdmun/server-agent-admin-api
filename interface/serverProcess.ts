
export interface IServerProcess {
  hostName: string
  serverName: string
  processPath: string
}

export interface IServerProcessInfo extends IServerProcess {
  alive: boolean
  processingTime: number
  threadId: number
  lastReceiveTime: string
}
