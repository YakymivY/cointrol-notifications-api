import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TelegramUsersRepository } from 'src/telegram-auth/repositories/telegram-users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramUsers } from 'src/telegram-auth/entities/telegram-users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TelegramUsers])],
  providers: [NotificationsService, TelegramUsersRepository],
})
export class NotificationsModule {}
