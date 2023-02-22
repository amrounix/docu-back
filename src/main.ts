import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getRootPath, staticAssetsPath, uploadRootPath } from './utils/path.util';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = new DocumentBuilder()
    .setTitle('IMG')
    .setDescription('The IMG-TEST API description')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();
  app.useStaticAssets(staticAssetsPath, { prefix: '/static/' });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);
  /*   app.enableCors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });
 */
  app.enableCors({});
  await app.listen(process.env.PORT ?? 8090);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`root path: ${getRootPath()}`);
  console.log(`upload path: ${uploadRootPath}`);
}
bootstrap();
