import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DynamodbDemoService } from './dynamodb-demo.service';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';

@Module({
  imports: [AuthModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, DynamodbDemoService],
})
export class IntegrationsModule {}
