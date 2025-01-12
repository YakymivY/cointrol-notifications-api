import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './entities/alert.entity';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AlertsRepository } from './repositories/alerts.repository';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { NotificationsService } from 'src/notifications/notifications.service';
import { TelegramUsersRepository } from 'src/telegram-auth/repositories/telegram-users.repository';
import { Coin } from './entities/coin.entity';
import { CoinsRepository } from './repositories/coins.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert, Coin]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule,
  ],
  providers: [
    AlertsService,
    AlertsRepository,
    NotificationsService,
    TelegramUsersRepository,
    CoinsRepository,
  ],
  controllers: [AlertsController],
  exports: [AlertsService],
})
export class AlertsModule {}
