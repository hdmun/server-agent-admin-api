
import { Request, Response, NextFunction } from 'express'

export const asyncWrap = (asyncFunc: Function) => {
  return (async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await asyncFunc(req, res, next)
    } catch (error) {
      return next(error)
    }
  })
}

export { HostController } from './HostController'
export { ProcessController } from './ProcessController'