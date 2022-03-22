import consola from 'consola'
import { Server } from 'socket.io'
import * as zmq from 'zeromq'

export class SubscribeService {
  subSock: zmq.Socket
  sockio: Server
  topics: string[]

  constructor(sockio: Server) {
    this.subSock = zmq.socket('sub')
    this.sockio = sockio
    this.topics = ['HostInfo', 'ServerInfo']
  }

  subscribe() {
    this.subSock.connect(`tcp://localhost:12345`)

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

  start() {
    this.subscribe()
    consola.info(`start PubSubService`)
  }
}
