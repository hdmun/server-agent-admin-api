import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HostServer } from './entity/host-server.entity';
import { HostController } from './host.controller';
import { HostService } from './host.service';

describe('HostController', () => {
  let hostController: HostController;
  let hostService: HostService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HostController],
      providers: [
        HostService,
        {
          provide: getRepositoryToken(HostServer),
          useClass: Repository
        },
      ],
    }).compile();

    hostController = app.get<HostController>(HostController);
    hostService = app.get<HostService>(HostService);
  });

  describe('root', () => {
    it('should return an array of hosts', async () => {
      const result = [{hostName: 'TestHost', ipAddr: 'HostAddr'}];
      jest.spyOn(hostService, 'getHosts').mockImplementation(async () => result);

      expect(await hostController.getHosts()).toBe(result);
    });
  });
});
