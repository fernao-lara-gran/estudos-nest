import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { AppConfiguration } from '../../config/configuration';

@Injectable()
export class DynamodbService implements OnModuleInit, OnModuleDestroy {
  private client!: DynamoDBClient;
  private doc!: DynamoDBDocumentClient;

  constructor(private readonly config: ConfigService<AppConfiguration, true>) {}

  onModuleInit(): void {
    const dynamodbConfig = this.config.get('dynamodb', { infer: true });

    this.client = new DynamoDBClient({
      region: dynamodbConfig.region,
      endpoint: dynamodbConfig.endpoint,
      credentials: {
        accessKeyId: dynamodbConfig.accessKeyId,
        secretAccessKey: dynamodbConfig.secretAccessKey,
      },
    });

    this.doc = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }

  getDocClient(): DynamoDBDocumentClient {
    return this.doc;
  }

  onModuleDestroy(): void {
    this.client.destroy();
  }
}
