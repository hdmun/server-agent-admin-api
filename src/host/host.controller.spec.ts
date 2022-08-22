import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AgentRepository } from '~/agent/agent.repository';
import { HostController } from './host.controller';
import { HostServerRepository } from './host.repository';
import { HostService } from './host.service';

describe('HostController', () => {
  let hostController: HostController;
  let hostService: HostService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HostController],
      imports: [HttpModule],
      providers: [HostService, HostServerRepository, AgentRepository],
    }).compile();

    hostController = app.get<HostController>(HostController);
    hostService = app.get<HostService>(HostService);
  });

  describe('getHosts', () => {
    it('should return an array of hosts', async () => {
      const hosts = [{ hostName: 'TestHost', ipAddr: 'localhost', process: [], alive: false, monitoring: false }];
      jest.spyOn(hostService, 'getHosts')
        .mockImplementation(async () => hosts);

      const result = await hostController.getHosts()
      expect(result).toBe(hosts);
    });
  });
});
