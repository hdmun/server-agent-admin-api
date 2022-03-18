import { Entity, Column, PrimaryColumn } from 'typeorm'

import { IHostServer } from '~/interface/hostServer'

@Entity({ name: 'HostServer' })
export class HostServer implements IHostServer {
  @PrimaryColumn({ length: 30, name: "HostName" })
  hostName: string = ''

  @Column({ length: 15, name: "IPAddr" })
  ipAddr: string = ''
}
