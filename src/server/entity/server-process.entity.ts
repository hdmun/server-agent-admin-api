import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from 'typeorm'
import { HostServer } from '~/host/entity/host-server.entity'

@Entity({ name: 'ServerProcess' })
export class ServerProcess {
  @PrimaryColumn({ length: 30, name: 'HostName' })
  hostName: string = ''

  @ManyToOne(() => HostServer)
  @JoinColumn({ name: 'HostName' })
  hostServer: HostServer

  @PrimaryColumn({ length: 255, name: 'ServerName' })
  serverName: string = ''

  @Column({ length: 255, name: 'BinaryPath' })
  binaryPath: string = ''
}
