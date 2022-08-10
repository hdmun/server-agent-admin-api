import { Controller, Get, Param, Delete, HttpStatus, HttpException } from '@nestjs/common';
import { ServerProcessResponse } from '~/dto/server';
import { ServerService } from './server.service';

@Controller('server')
export class ServerController {
  constructor(
    private readonly serverService: ServerService
  ) { }

  @Get()
  async getServers(): Promise<ServerProcessResponse[]> {
    return await this.serverService.getServers();
  }

  @Delete('/:hostName/:serverName/:command')
  async deleteServer(
    @Param('hostName') hostName: string,
    @Param('serverName') serverName: string,
    @Param('command') command: string
  ) {
    try {
      const server = await this.serverService.getServer(hostName, serverName)
      if (server === null) {
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      }

      // todo: validate param

      return await this.serverService.deleteServer(server.hostServer.ipAddr, {
        killCommand: command,
        serverName
      })
    }
    catch (error) {
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
