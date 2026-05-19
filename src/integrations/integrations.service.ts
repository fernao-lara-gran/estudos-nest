import { Injectable } from '@nestjs/common';
import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamodbService } from '../infra/dynamodb/dynamodb.service';
import { DrizzleService } from '../infra/drizzle/drizzle.service';
import { MysqlService } from '../infra/mysql/mysql.service';
import { users } from '../database/schema';

export interface IntegrationStatus {
  mysql: { ok: boolean; detail?: string };
  drizzle: { ok: boolean; detail?: string };
  dynamodb: { ok: boolean; detail?: string; tables?: string[] };
}

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly mysql: MysqlService,
    private readonly drizzle: DrizzleService,
    private readonly dynamodb: DynamodbService,
  ) {}

  async getStatus(): Promise<IntegrationStatus> {
    const status: IntegrationStatus = {
      mysql: { ok: false },
      drizzle: { ok: false },
      dynamodb: { ok: false },
    };

    try {
      await this.mysql.getPool().query('SELECT 1');
      status.mysql = { ok: true };
    } catch (error) {
      status.mysql = {
        ok: false,
        detail: error instanceof Error ? error.message : 'erro desconhecido',
      };
    }

    try {
      await this.drizzle.getDb().select().from(users).limit(1);
      status.drizzle = { ok: true };
    } catch (error) {
      status.drizzle = {
        ok: false,
        detail: error instanceof Error ? error.message : 'erro desconhecido',
      };
    }

    try {
      const out = await this.dynamodb
        .getDocClient()
        .send(new ListTablesCommand({}));
      status.dynamodb = {
        ok: true,
        tables: out.TableNames ?? [],
      };
    } catch (error) {
      status.dynamodb = {
        ok: false,
        detail: error instanceof Error ? error.message : 'erro desconhecido',
      };
    }

    return status;
  }
}
