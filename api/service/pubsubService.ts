import consola from 'consola'
import { Server } from 'socket.io'
import * as zmq from 'zeromq'

export class SubscribeService {
  subSock: zmq.Socket
  sockio: Server

  constructor(sockio: Server) {
    this.subSock = zmq.socket('sub')
    this.sockio = sockio
  }

  subscribe() {
    this.subSock.connect(`tcp://localhost:12345`)
    this.subSock.subscribe(`ServerInfo`)
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
