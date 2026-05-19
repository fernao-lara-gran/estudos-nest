import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mysql, { Pool } from 'mysql2/promise';
import type { AppConfiguration } from '../../config/configuration';
import { USERS_TABLE_SQL } from './mysql-schema';

@Injectable()
export class MysqlService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MysqlService.name);
  private pool!: Pool;

  constructor(private readonly config: ConfigService<AppConfiguration, true>) {}

  async onModuleInit(): Promise<void> {
    const mysqlConfig = this.config.get('mysql', { infer: true });

    const bootstrap = await mysql.createConnection({
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
    });

    await bootstrap.query(
      `CREATE DATABASE IF NOT EXISTS \`${mysqlConfig.database}\``,
    );
    await bootstrap.end();

    this.pool = mysql.createPool({
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      database: mysqlConfig.database,
    });

    await this.pool.query('SELECT 1');
    await this.pool.query(USERS_TABLE_SQL);
    this.logger.log('MySQL pool conectado');
  }

  getPool(): Pool {
    return this.pool;
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
