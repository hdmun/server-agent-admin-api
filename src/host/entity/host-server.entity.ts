import { Entity, Column, PrimaryColumn, JoinColumn, OneToMany } from 'typeorm'
import { ServerProcess } from '~/server/entity/server-process.entity'

@Entity({ name: 'HostServer' })
export class HostServer {
  @PrimaryColumn({ length: 30, name: 'HostName' })
  hostName: string = ''

  @Column({ length: 15, name: 'IPAddr' })
  ipAddr: string = ''

  @OneToMany(() => ServerProcess, (process) => process.hostServer)
  process: ServerProcess[]

  alive: boolean = false
  monitoring: boolean = false
}
