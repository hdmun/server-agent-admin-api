import { Controller, Get } from '@nestjs/common';
import { HostService } from './host.service';

@Controller('hosts')
export class HostController {
  constructor(private readonly hostService: HostService) {}

  @Get()
  async getHosts() {
    const hosts = await this.hostService.getHosts();
    return hosts
  }
}
