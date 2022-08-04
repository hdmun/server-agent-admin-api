
export interface ServerProcessKillRequest {
  killCommand: string
  serverName: string
}

export interface ServerProcessKillResponse {
  serverName: string
  exitCode: number
  close: boolean
}
