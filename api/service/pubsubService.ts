import consola from 'consola'
import { Server } from 'socket.io'
import * as zmq from 'zeromq'

import { AppDataSource } from '../data-source'
import { HostServer } from '../entity/HostServer'

export class SubscribeService {
  subSock: zmq.Socket

  sockio: Server
  topics: string[]

  constructor(sockio: Server) {
    this.subSock = zmq.socket('sub')
    this.sockio = sockio
    this.topics = ['HostInfo', 'ServerInfo']
  }

  async subscribe(port: number) {
    const servers = await AppDataSource.manager.find(HostServer);
    for (const server of servers) {
      this.subSock.connect(`tcp://${server.ipAddr}:${port}`)
    }

    for (const topic of this.topics) {
      this.subSock.subscribe(topic)
      consola.log(`subscribe ${topic}`)
    }

    this.sockio.on('connection', (socket) => {
      this.subSock.on('message', (topic, message) => {
        socket.emit(`${topic}`, `${message}`)
      })
    })
  }

  async start(port: number) {
    await this.subscribe(port)
    consola.info(`start PubSubService`)
  }
}
