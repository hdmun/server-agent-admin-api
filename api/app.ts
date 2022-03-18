import 'reflect-metadata'
import * as http from 'http'
import express, { Express } from 'express'
import consola from 'consola'

import { HostController } from './controller'
import dbConnection from './infrastructure/connection'

export default class ServerApp {
  app: Express
  config: any
  nuxt: any
  port: number
  host: string

  httpServer: http.Server
  hostController: HostController

  constructor () {
    this.app = express()

    const config = require('./config.json')
    this.host = config.host
    this.port = config.port

    this.httpServer = http.createServer(this.app)

    this.hostController = new HostController()
  }

  initializeRouter() {
    consola.info(`initialize router`);
    this.app.use(this.hostController.router)
  }

  async setup() {
    await dbConnection()
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
  }
}
