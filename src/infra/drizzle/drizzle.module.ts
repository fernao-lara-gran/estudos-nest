import { Global, Module } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';
import { MysqlModule } from '../mysql/mysql.module';

@Global()
@Module({
  imports: [MysqlModule],
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DrizzleModule {}
