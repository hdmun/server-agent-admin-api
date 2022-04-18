import consola from 'consola'
import axios from 'axios'
import { Router, Request, Response, NextFunction } from 'express'

import { AppDataSource } from '../data-source'
import { HostServer } from '../entity/HostServer'
import { IHostServerInfo, IServersMonitoring } from '~/interface/HostServer'

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
  port: number

  constructor(port: number) {
    this.router = Router()
    this.router.get('/servers', async_(this.all))
    this.router.put('/servers/monitoring', async_(this.monitoring))
    this.port = port
  }

  private all = async (_req: Request, res: Response, _next: NextFunction) => {
    try {
      const servers = await AppDataSource.manager.find(HostServer);
      res.status(200).json(servers)
    } catch (error) {
      consola.error(`${error}`)
      res.status(503).json({error: `"${error}"`})
    }
  }

  private monitoring = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const reqBody = req.body as IHostServerInfo

      const hostServer = await AppDataSource.getRepository(HostServer)
        .createQueryBuilder('HostServer')
        .where('HostServer.HostName = :hostName', {hostName: reqBody.hostName})
        .getOne()

      // check undefined
      if (hostServer === null) {
        res.status(400).json({})
        return;
      }

      const response = await axios.put<IServersMonitoring>(
        `http://${hostServer.ipAddr}:${this.port}/server/monitoring`, {
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
