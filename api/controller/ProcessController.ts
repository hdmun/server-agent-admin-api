
import consola from 'consola'
import { Router, Request, Response, NextFunction } from 'express'
import axios from 'axios'

import { AppDataSource } from '../data-source'
import { ServerProcess } from '../entity/ServerProcess'
import { HostServer } from '../entity/HostServer'
import { asyncWrap } from '.'
import { IRequestProcessKill, IResponseProcessKill } from '~/interface/ServerProcess'


export class ProcessController {
  readonly router: Router
  readonly port: number

  constructor(port: number) {
    this.router = Router()
    this.router.get('/process', asyncWrap(this.all))
    this.router.put('/process/kill', asyncWrap(this.kill))
    this.port = port
  }

  private all = async (_req: Request, res: Response, _nex: NextFunction) => {
    try {
      const serverProcess = await AppDataSource.getRepository(ServerProcess).find()
      res.status(200).json(serverProcess)
    } catch (error) {
      consola.error(`${error}`)
      res.status(503).json({error: `"${error}"`})
    }
  }

  private kill = async (req: Request, res: Response, _nex: NextFunction) => {
    try {
      const reqBody = req.body as IRequestProcessKill

      const hostServer = await AppDataSource.getRepository(HostServer)
        .createQueryBuilder('HostServer')
        .where('HostServer.HostName = :hostName', {hostName: reqBody.hostName})
        .getOne()

      // check undefined
      if (hostServer === null) {
        consola.error(`invalid HostName '${reqBody.hostName}'`)
        res.status(400).json({})
        return;
      }

      const serverProcess = await AppDataSource.getRepository(ServerProcess)
        .createQueryBuilder()
        .where('ServerProcess.HostName = :hostName', {hostName: reqBody.hostName})
        .andWhere('ServerProcess.ServerName = :serverName', {serverName: reqBody.serverName})
        .getOne()

      if (serverProcess === null) {
        consola.error(`invalid ServerName '${reqBody.serverName}' in '${reqBody.hostName}'`)
        res.status(400).json({})
        return;
      }

      const response = await axios.put<IResponseProcessKill>(
        `http://${hostServer.ipAddr}:${this.port}/process/kill`, {
          killCommand: reqBody.killCommand,
          serverName: reqBody.serverName,
        })

      res.status(response.status).json(response.data)
    } catch (error) {
      consola.error(`${error}`)
      res.status(503).json({error: `"${error}"`})
    }
  }
}
