import { Repository } from 'typeorm';
import { CustomRepository } from '~/typeorm-ex/typeorm-ex.decorator';
import { HostServer } from './entity/host-server.entity';

@CustomRepository(HostServer)
export class HostServerRepository extends Repository<HostServer> { }