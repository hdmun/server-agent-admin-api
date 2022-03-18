import { createConnection } from 'typeorm'

export default async () => {
  await createConnection({
    type: 'mssql',
    host: 'localhost',
    port: 1433,
    username: 'sa',
    password: 'password',
    database: 'ServerAgent',
    options: { encrypt: false },
    entities: ['api/entity/*.ts'],
  })
}
