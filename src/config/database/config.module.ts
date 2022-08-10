import { Module } from '@nestjs/common';
import { SqlServerConfigService } from './config.service';

@Module({
  providers: [SqlServerConfigService],
})
export class SqlServerConfigModule {}