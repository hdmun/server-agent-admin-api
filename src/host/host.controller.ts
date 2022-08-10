import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch } from '@nestjs/common';
import { SetMonitoringRequest } from '~/dto/monitoring';
import { HostService } from './host.service';

@Controller('host')
export class HostController {
  constructor(private readonly hostService: HostService) { }

  @Get()
  async getHosts() {
    return await this.hostService.getHosts();
  }

  @Patch('/monitoring/:hostName')
  async setMonitoring(
    @Param('hostName') hostName: string,
    @Body() setMonitoringDto: SetMonitoringRequest
  ) {
    try {
      const hostServer = await this.hostService.getHost(hostName)
      if (hostServer === null) {
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      }

      const result = await this.hostService
        .updateMonitoring({ hostName, on: setMonitoringDto.on })

      return {
        hostName,
        on: result.on
      }
    }
    catch (error) {
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
