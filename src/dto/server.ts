
export interface ServerProcessResponse {
  hostName: string
  serverName: string
  processName: string
  threadId: number
  processingTime: number
  receiveTime: string
}

export interface ServerProcessState {
  threadId: number
  processingTime: number
  receiveTime: string
}

export interface ServerProcessKillRequest {
  killCommand: string
  serverName: string
}

// 네이밍이 싹다 마음에 안드네 이거
interface ServerProcessKillResult {
  serverName: string
  exitCode: number
  close: boolean
}

export interface ServerProcessKillResponse {
  servers: ServerProcessKillResult[]
}
