import 'reflect-metadata'
import { DataSource } from 'typeorm'

import ormconfig from '../ormconfig.json'

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: ormconfig.host,
  port: ormconfig.port,
  username: ormconfig.username,
  password: ormconfig.password,
  database: ormconfig.database,
  options: ormconfig.options,
  entities: ormconfig.entities
})
