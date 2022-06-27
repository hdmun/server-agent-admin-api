import { Entity, Column, PrimaryColumn } from 'typeorm'

@Entity({ name: 'HostServer' })
export class HostServer {
  @PrimaryColumn({ length: 30, name: 'HostName' })
  hostName: string = ''

  @Column({ length: 15, name: 'IPAddr' })
  ipAddr: string = ''
}
