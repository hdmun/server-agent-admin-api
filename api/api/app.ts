import * as http from 'http'
import { Server } from 'socket.io'
import express, { Express } from 'express'
import consola from 'consola'

import { HostController, ProcessController } from './controller'
import { AppDataSource } from './data-source'
import { SubscribeService } from './service/pubsubService'

export default class ServerApp {
  app: Express
  config: any
  nuxt: any
  port: number
  subscribePort: number
  axiosPort: number
  host: string

  httpServer: http.Server
  hostController: HostController
  processController: ProcessController

  sockio: Server
  pubsubService: SubscribeService

  constructor () {
    this.app = express()
    this.app.use(express.json())

    const config = require('./config.json')
    // this.host = 'localhost'
    this.host = config.listen.host
    this.port = config.listen.port
    this.subscribePort = config.connect.agentSubPort
    this.axiosPort = config.connect.agentHttpPort

    this.httpServer = http.createServer(this.app)
    this.hostController = new HostController(this.axiosPort)
    this.processController = new ProcessController(this.axiosPort)

    this.sockio = new Server(this.httpServer, config.socketio)
    this.pubsubService = new SubscribeService(this.sockio)
  }

  initializeRouter() {
    consola.info(`initialize router`);
    this.app.use(this.hostController.router)
    this.app.use(this.processController.router)
  }

  async setup() {
    try {
      await AppDataSource.initialize()
    } catch (error) {
      consola.error(error)
      throw error
    }
    consola.info(`connected database`);

    this.initializeRouter()
  }

  listen() {
    this.httpServer.listen(this.port, () => {
      consola.log(`ServerApp listening on the port ${this.port}`)
    })

    consola.ready({
      message: `Server listening on http://${this.host}:${this.port}`,
      badge: true,
    })
  }

  async start() {
    await this.setup()
    await this.pubsubService.start(this.subscribePort)

    this.listen()
  }
}
