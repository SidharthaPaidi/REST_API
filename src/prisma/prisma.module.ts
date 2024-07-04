import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()// by just adding global the current module is accessable to all the other modules
@Module({
  providers: [PrismaService],
  exports : [PrismaService] //exporting the prisma services
})
export class PrismaModule {}
