import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DynamodbDemoService } from './dynamodb-demo.service';
import { IntegrationsService } from './integrations.service';

@ApiTags('integrations')
@ApiBearerAuth('bearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly integrations: IntegrationsService,
    private readonly dynamodbDemo: DynamodbDemoService,
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Status MySQL, Drizzle e DynamoDB',
  })
  @ApiOkResponse({ description: 'Ping de cada integração' })
  getStatus() {
    return this.integrations.getStatus();
  }

  @Post('dynamodb/demo')
  @ApiOperation({ summary: 'Demo Put + Get no DynamoDB Local' })
  demoDynamodb() {
    return this.dynamodbDemo.run();
  }
}
