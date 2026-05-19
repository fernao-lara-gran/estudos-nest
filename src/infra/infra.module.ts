import { Global, Module } from '@nestjs/common';
import { DynamodbModule } from './dynamodb/dynamodb.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { MysqlModule } from './mysql/mysql.module';

@Global()
@Module({
  imports: [MysqlModule, DrizzleModule, DynamodbModule],
  exports: [MysqlModule, DrizzleModule, DynamodbModule],
})
export class InfraModule {}
