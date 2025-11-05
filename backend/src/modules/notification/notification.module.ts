import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationSetting } from './entities/notification-setting.entity';
import { User } from '../user/entities/user.entity';
import { EmailService } from './services/email.service';
import { TelegramService } from './services/telegram.service';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationSetting, User]),
  ],
  controllers: [NotificationController],
  providers: [EmailService, TelegramService, NotificationService],
  exports: [NotificationService, EmailService, TelegramService],
})
export class NotificationModule {}


