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
  host: string

  httpServer: http.Server
  hostController: HostController
  processController: ProcessController

  sockio: Server
  pubsubService: SubscribeService

  constructor () {
    this.app = express()
    this.app.use(express.json())

    const nuxtConfig = require('../nuxt.config').default
    // this.host = 'localhost'
    this.host = nuxtConfig.server.host
    this.port = nuxtConfig.server.expressPort

    this.httpServer = http.createServer(this.app)
    this.hostController = new HostController()
    this.processController = new ProcessController()

    this.sockio = new Server(this.httpServer, {
      cors: {
        origin: `http://${nuxtConfig.server.host}:${nuxtConfig.server.port}`
      }
    })
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
    this.httpServer.listen(this.port, this.host, () => {
      consola.log(`ServerApp listening on the port ${this.port}`)
    })

    consola.ready({
      message: `Server listening on http://${this.host}:${this.port}`,
      badge: true,
    })
  }

  async start() {
    await this.setup()
    this.listen()

    this.pubsubService.start()
  }
}
