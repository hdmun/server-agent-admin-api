export interface IHostServer {
  hostName: string
  ipAddr: string
}

export interface IHostServerInfo {
  hostName: string
  monitoring: boolean
}

export interface IServersMonitoring {
  hostName: string
  on: boolean
}
