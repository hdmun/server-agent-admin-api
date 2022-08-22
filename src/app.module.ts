import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NtlmModule } from './auth/ntlm.module';
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
    NtlmModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
