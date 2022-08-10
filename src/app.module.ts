import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SqlServerConfigModule } from './config/database/config.module';
import { SqlServerConfigService } from './config/database/config.service';
import { HostModule } from './host/host.module';
import { ServerModule } from './server/server.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [SqlServerConfigModule],
      useClass: SqlServerConfigService,
      inject: [SqlServerConfigService],
    }),
    HostModule,
    ServerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
