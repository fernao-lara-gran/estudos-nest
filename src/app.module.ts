import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { InfraModule } from './infra/infra.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { UsersModule } from './users/users.module';

const skipInfra = process.env.SKIP_INFRA === '1';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      ignoreEnvFile: skipInfra,
    }),
    ...(skipInfra ? [] : [InfraModule, IntegrationsModule, UsersModule]),
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
