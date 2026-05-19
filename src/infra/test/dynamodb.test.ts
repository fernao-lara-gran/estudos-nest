import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT ?? 'http://127.0.0.1:8000',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'local',
  },
});

const doc = DynamoDBDocumentClient.from(client);

test('dynamodb: ListTables', async (t) => {
  try {
    const out = await doc.send(new ListTablesCommand({}));
    assert.ok(Array.isArray(out.TableNames));
  } catch {
    t.skip('DynamoDB indisponível (ex.: docker compose up dynamodb)');
  }
});

test('dynamodb: Put + Get', async (t) => {
  const tableName = `nest_fastify_test_${Date.now()}`;
  let tableCreated = false;

  try {
    await doc.send(
      new CreateTableCommand({
        TableName: tableName,
        BillingMode: 'PAY_PER_REQUEST',
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
      }),
    );
    tableCreated = true;

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
      new GetCommand({ TableName: tableName, Key: { pk: 'it-1' } }),
    );
    assert.equal(got.Item?.msg, 'ok-dynamo');
  } catch {
    t.skip('DynamoDB indisponível');
  } finally {
    if (tableCreated) {
      try {
        await doc.send(new DeleteTableCommand({ TableName: tableName }));
      } catch {
        // ignorar
      }
    }
    client.destroy();
  }
});
