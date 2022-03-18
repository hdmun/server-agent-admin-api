export interface IHostServer {
  hostName: string
  ipAddr: string
  monitoring?: boolean
  alive?: boolean
  aliveAckTime?: Date
  aliveAckText?: string
}
