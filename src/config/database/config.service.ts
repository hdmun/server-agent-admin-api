import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'

@Injectable()
export class SqlServerConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) { }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mssql',
      username: this.configService.get<string>('SA_ADMIN_DB_USER'),
      password: this.configService.get<string>('SA_ADMIN_DB_PASSWORD'),
      port: +this.configService.get<number>('SA_ADMIN_DB_PORT'),
      host: this.configService.get<string>('SA_ADMIN_DB_HOST'),
      database: this.configService.get<string>('SA_ADMIN_DB_NAME'),
      entities: ['dist/**/**/*.entity{.ts,.js}'],
      logging: process.env.NODE_ENV === 'dev' ? ["query", "error"] : undefined
    }
  }
}