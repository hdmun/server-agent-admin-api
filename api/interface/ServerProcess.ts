
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

export interface IRequestProcessKill {
  hostName: string
  killCommand: string
  serverName: string
}

export interface IResponseProcessKill {
  serverName: string
  exitCode: number
  close: boolean
}
