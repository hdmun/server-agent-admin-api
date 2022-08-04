import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AgentRepository } from '~/agent/agent.repository';
import { TypeOrmExModule } from '~/typeorm-ex/typeorm-ex.module';
import { ServerController } from './server.controller';
import { ServerProcessRepository } from './server.repository';
import { ServerService } from './server.service';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([ServerProcessRepository]),
    HttpModule
  ],
  controllers: [ServerController],
  providers: [ServerService, AgentRepository],
})
export class ServerModule { }
