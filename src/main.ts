import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const msg =
          errors.flatMap((e) => Object.values(e.constraints ?? {}))[0] ??
          'Validação falhou';
        return new BadRequestException({ message: msg });
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('nest-estudo')
    .setDescription('API de demonstração e estudos (NestJS + Fastify).')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Envie o token retornado em `POST /login` no header `Authorization: Bearer <token>`.',
      },
      'bearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`API:     http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/docs`);
}

void bootstrap();
