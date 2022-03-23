import consola from 'consola'
import axios from 'axios'
import { Router, Request, Response, NextFunction } from 'express'
import { getConnection, getRepository } from 'typeorm'

import { HostServer } from '../entity/HostServer'
import { IHostServerInfo, IServersMonitoring } from '~/interface/hostServer'

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
    this.router.put('/servers/monitoring', async_(this.monitoring))
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

  async monitoring(req: Request, res: Response, _next: NextFunction) {
    try {
      const reqBody = req.body as IHostServerInfo

      const hostServer = await getRepository(HostServer)
        .createQueryBuilder('HostServer')
        .where('HostServer.HostName = :hostName', {hostName: reqBody.hostName})
        .getOne()

      // check undefined
      if (hostServer === undefined) {
        res.status(400).json({})
        return;
      }

      const response = await axios.put<IServersMonitoring>(
        `http://${hostServer?.ipAddr}/server/monitoring`, {
          hostName: hostServer.hostName,
          on: reqBody.monitoring
        })

      res.status(response.status).json({
        hostName: hostServer.hostName,
        monitoring: reqBody.monitoring
      })
    } catch (error) {
      consola.error(`${error}`)
      res.status(503).json(error)
    }
  }
}
