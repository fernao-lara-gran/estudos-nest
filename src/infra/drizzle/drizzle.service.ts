import { Injectable, OnModuleInit } from '@nestjs/common';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../../database/schema';
import { MysqlService } from '../mysql/mysql.service';

@Injectable()
export class DrizzleService implements OnModuleInit {
  private db!: MySql2Database<typeof schema>;

  constructor(private readonly mysql: MysqlService) {}

  onModuleInit(): void {
    this.db = drizzle(this.mysql.getPool(), {
      schema,
      mode: 'default',
    });
  }

  getDb(): MySql2Database<typeof schema> {
    return this.db;
  }
}
