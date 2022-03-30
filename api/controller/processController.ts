
import consola from 'consola'
import { Router, Request, Response, NextFunction } from 'express'
import { getRepository } from 'typeorm'

import { ServerProcess } from '../entity/ServerProcess'
import { asyncWrap } from '.'

export class ProcessController {
  router: Router

  constructor() {
    this.router = Router()
    this.router.get('/process', asyncWrap(this.all))
  }

  async all(_req: Request, res: Response, _nex: NextFunction) {
    try {
      const serverProcess = await getRepository(ServerProcess).find()
      res.status(200).json(serverProcess)
    } catch (error) {
      consola.error(`${error}`)
      res.status(503).json({error: `"${error}"`})
    }
  }
}
