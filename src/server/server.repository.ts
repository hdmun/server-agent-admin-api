import { Repository } from 'typeorm';
import { CustomRepository } from '~/typeorm-ex/typeorm-ex.decorator';
import { ServerProcess } from './entity/server-process.entity';

@CustomRepository(ServerProcess)
export class ServerProcessRepository extends Repository<ServerProcess> { }