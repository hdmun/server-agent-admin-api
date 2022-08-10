import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AgentRepository } from '~/agent/agent.repository';
import { HostServerRepository } from './host.repository';
import { HostService } from './host.service';


describe('HostService Test', () => {
  let hostService: HostService;
  let hostRepository: HostServerRepository

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [HostService, HostServerRepository, AgentRepository],
    }).compile();

    hostService = app.get<HostService>(HostService);
    hostRepository = app.get<HostServerRepository>(HostServerRepository);
  });

  describe('getHosts', () => {
    it('should return an array of hosts', async () => {
      const hosts = [{ hostName: 'TestHost', ipAddr: 'localhost' }];
      jest.spyOn(hostRepository, 'find')
        .mockResolvedValue(hosts);

      const result = await hostService.getHosts()

      expect(result).toEqual(hosts);
    });
  });
});
