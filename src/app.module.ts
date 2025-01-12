import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PriceTrackerModule } from './price-tracker/price-tracker.module';
import { AlertsModule } from './alerts/alerts.module';
import { NotificationsModule } from './notifications/notifications.module';
import AppDataSource from 'data-source';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { JwtStrategy } from './shared/jwt.strategy';
import { UsersRepository } from './shared/repositories/users.repository';
import { TelegramAuthModule } from './telegram-auth/telegram-auth.module';

@Module({
  imports: [
    PriceTrackerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env`],
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    AlertsModule,
    NotificationsModule,
    SharedModule,
    TelegramAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, UsersRepository],
  exports: [JwtStrategy],
})
export class AppModule {}
