export interface HostStateResponse {
  on: boolean
}

export interface HostStateDto {
  monitoring: boolean
  alive: boolean
}

export interface SetMonitoringRequest {
  on: boolean
}

export interface SetMonitoringResponse {
  hostName: string
  on: boolean
}

export interface ServerMonitoringRequest {
  hostName: string
  on: boolean
}

export interface ServerMonitoringResponse {
  on: boolean
}