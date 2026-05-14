import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    .setDescription('API de demonstração e estudos (NestJS).')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Envie o token retornado em `POST /login/` no header `Authorization: Bearer <token>`.',
      },
      'bearerAuth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
