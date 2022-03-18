import consola from 'consola'
import { Router, Request, Response, NextFunction } from 'express'
import { getConnection } from 'typeorm'

import { HostServer } from '../entity/hostServer'

const async_ = (asyncFn: Function) => {
  return (async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await asyncFn(req, res, next)
    } catch (error) {
      return next(error)
    }
  })
}

export class HostController {
  router: Router

  constructor() {
    this.router = Router()
    this.router.get('/servers', async_(this.all))
  }

  async all(_req: Request, res: Response, _next: NextFunction) {
    try {
      const servers = await getConnection().manager.find(HostServer);
      res.status(200).json(servers)
    } catch (error) {
      consola.error(`${error}`)
      res.status(503).json({error: `"${error}"`})
    }
  }
}
