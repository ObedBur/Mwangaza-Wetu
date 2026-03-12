import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { join } from 'path';
import * as fs from 'fs';
import helmet from 'helmet';
import { BenchInterceptor } from './common/interceptors/bench.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //  Sécurité HTTP — en-têtes de protection (HSTS, X-Frame-Options, etc.)
  app.use(helmet());

  // Augmenter la limite de taille pour les photos et empreintes (Base64)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Dossier uploads
  const uploadsPath = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  // Pas de setGlobalPrefix car les contrôleurs utilisent déjà 'api/' dans leur décorateur
  // Ex: @Controller('api/membres'), @Controller('api/auth'), etc.

  // Activer CORS pour permettre les requêtes depuis le frontend Next.js
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:4000',
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

  // 🔬 Intercepteur de latence — affiche le temps de traitement de chaque requête
  app.useGlobalInterceptors(new BenchInterceptor());

  // 📝 Configuration Swagger (Documentation API)
  const config = new DocumentBuilder()
    .setTitle('Mwangaza Wetu API')
    .setDescription('Documentation officielle de l\'API Mwangaza Wetu - Système de gestion coopérative.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'JWT-auth', // Identifiant interne pour @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const files = fs.readdirSync(uploadsPath);
  console.log(`\n🚀 Backend Mwangaza Wetu démarré sur : http://localhost:${port}`);
  console.log(`📂 Dossier uploads : ${uploadsPath} (${files.length} fichiers)`);
  if (files.length > 0) console.log(`📄 Dernier fichier : ${files[files.length - 1]}`);
  console.log(`🌐 Accès images : http://localhost:${port}/uploads/...\n`);
}
void bootstrap();
