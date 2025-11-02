import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger文档
  const config = new DocumentBuilder()
    .setTitle('ProxyHub API')
    .setDescription('ProxyHub代理IP管理平台API文档')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addTag('Auth', '认证相关接口')
    .addTag('User', '用户相关接口')
    .addTag('Proxy', '代理相关接口')
    .addTag('Billing', '账单相关接口')
    .addTag('Order', '订单相关接口')
    .addTag('Admin', '管理员相关接口')
    .addTag('Dashboard', '仪表盘相关接口')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`
========================================
  ProxyHub Backend Started!
========================================
  API Server: http://localhost:${port}/api/v1
  API Docs:   http://localhost:${port}/api
  Environment: ${process.env.NODE_ENV || 'development'}
========================================
  `);
}
bootstrap();

