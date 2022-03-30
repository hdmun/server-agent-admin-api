import { Entity, Column, PrimaryColumn } from 'typeorm'

import { IServerProcess } from '~/interface/serverProcess'

@Entity({ name: 'ServerProcess' })
export class ServerProcess implements IServerProcess {
  @PrimaryColumn({ length: 30, name: "HostName" })
  hostName: string = ''

  @PrimaryColumn({ length: 255, name: "ServerName" })
  serverName: string = ''

  @Column({ length: 255, name: "ProcessPath" })
  processPath: string = ''
}
