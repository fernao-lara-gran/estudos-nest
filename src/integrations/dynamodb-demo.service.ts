import { Injectable } from '@nestjs/common';
import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
} from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamodbService } from '../infra/dynamodb/dynamodb.service';

@Injectable()
export class DynamodbDemoService {
  constructor(private readonly dynamodb: DynamodbService) {}

  async run(): Promise<{
    table: string;
    item: Record<string, unknown> | undefined;
  }> {
    const doc = this.dynamodb.getDocClient();
    const tableName = `nest_fastify_plugin_test_${Date.now()}`;

    await doc.send(
      new CreateTableCommand({
        TableName: tableName,
        BillingMode: 'PAY_PER_REQUEST',
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
      }),
    );

    for (let i = 0; i < 40; i++) {
      const desc = await doc.send(
        new DescribeTableCommand({ TableName: tableName }),
      );
      if (desc.Table?.TableStatus === 'ACTIVE') break;
      await new Promise((r) => setTimeout(r, 250));
    }

    await doc.send(
      new PutCommand({
        TableName: tableName,
        Item: { pk: 'it-1', msg: 'ok-dynamo' },
      }),
    );

    const got = await doc.send(
      new GetCommand({
        TableName: tableName,
        Key: { pk: 'it-1' },
      }),
    );

    try {
      await doc.send(new DeleteTableCommand({ TableName: tableName }));
    } catch {
      // demo
    }

    return { table: tableName, item: got.Item };
  }
}
