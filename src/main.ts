import 'dotenv/config';
import { createClient } from 'redis';
import session from 'express-session';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { RedisStore } from 'connect-redis';
import { stringify } from 'yaml';
import { NestExpressApplication } from '@nestjs/platform-express';
import { configObject } from './config/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CustomLogger } from './common/logger/logger.service';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const InitializeClients = async () => {
  const username = process.env.REDIS_USERNAME;
  const password = process.env.REDIS_PASSWORD;
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;

  const redisClient = createClient({
    url: `redis://${username}:${password}@${host}:${port}`,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  await redisClient.connect();
  const store: RedisStore = new RedisStore({
    client: redisClient,
    prefix: 'Authify',
  });
  if (!store) {
    throw new Error('Error connecting to redis store');
  }
  return store;
};

const ascertainConfigExists = () => {
  try {
    const rootDir = process.cwd();
    const configDir = path.join(rootDir, 'src', 'config');
    const file = path.join(configDir, 'app.yaml');
    const exists = fs.existsSync(file);
    const data = stringify(configObject, null, 1);

    if (!exists) {
      fs.writeFileSync(file, data);
    }
  } catch (error) {
    console.log('Error processing config', error);
  }
};

async function bootstrap() {
  const redisStore = await InitializeClients();
  ascertainConfigExists();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useStaticAssets(path.join(__dirname, '..', 'src', 'public'));
  app.setBaseViewsDir(path.join(__dirname, '..', 'src', 'public', 'views'));
  app.setViewEngine('ejs');
  app.useLogger(app.get(CustomLogger));

  const config = new DocumentBuilder()
    .setTitle('Meditrack')
    .setDescription('The authentication endpoints')
    .setVersion('1.0')
    .addCookieAuth('sessionId') // optional
    .build();

  if (!process.env.COOKIE_SECRET) {
    throw new Error('cookie secret not set');
  }

  app.use(
    session({
      secret: process.env.COOKIE_SECRET || '',
      resave: false,
      store: redisStore,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        path: '/',
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000, process.env.HOST ?? '0.0.0.0');
}
bootstrap();
