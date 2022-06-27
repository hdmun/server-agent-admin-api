import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SqlServerConfigModule } from './config/database/config.module';
import { SqlServerConfigService } from './config/database/config.service';
import { HostServer } from './host/entity/host-server.entity';
import { HostController } from './host/host.controller';
import { HostService } from './host/host.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [SqlServerConfigModule],
      useClass: SqlServerConfigService,
      inject: [SqlServerConfigService],
    }),
    TypeOrmModule.forFeature([HostServer])
  ],
  controllers: [AppController, HostController],
  providers: [AppService, HostService],
})
export class AppModule {}
