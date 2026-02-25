import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Pas de setGlobalPrefix car les contrôleurs utilisent déjà 'api/' dans leur décorateur
  // Ex: @Controller('api/membres'), @Controller('api/auth'), etc.

  // Activer CORS pour permettre les requêtes depuis le frontend Next.js
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true, // Nécessaire pour envoyer les cookies d'authentification
  });

  // Validation automatique des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Supprime les propriétés non déclarées dans le DTO
      forbidNonWhitelisted: true,
      transform: true,       // Convertit automatiquement les types (string → number, etc.)
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(` Backend Mwangaza Wetu démarré sur http://localhost:${port}`);
}
void bootstrap();
