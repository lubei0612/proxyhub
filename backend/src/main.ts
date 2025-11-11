import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigValidator } from './common/security/config-validator';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HelmetConfigurer } from './common/security/helmet-config';
import { EnhancedCorsOptions } from './common/security/cors-config';

async function bootstrap() {
  // ✅ Validate configuration BEFORE creating the app
  // This ensures application won't start with invalid or missing configuration
  ConfigValidator.validateConfig();

  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix('api/v1');

  // ✅ Security headers with Helmet (applied BEFORE CORS)
  app.use(helmet(HelmetConfigurer.getConfig()));

  // ✅ Environment-aware CORS configuration
  app.enableCors(EnhancedCorsOptions.getOptions());

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ✅ Global exception filter (registered AFTER ValidationPipe)
  // Catches all exceptions and returns standardized error responses
  app.useGlobalFilters(new AllExceptionsFilter());

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

