import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AgentRepository } from '~/agent/agent.repository';
import { TypeOrmExModule } from '~/typeorm-ex/typeorm-ex.module';
import { HostController } from './host.controller';
import { HostServerRepository } from './host.repository';
import { HostService } from './host.service';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([HostServerRepository]),
    HttpModule
  ],
  controllers: [HostController],
  providers: [HostService, AgentRepository],
})
export class HostModule { }
