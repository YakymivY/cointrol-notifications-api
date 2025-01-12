import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Alert } from 'src/alerts/entities/alert.entity';
import { TelegramUsersRepository } from 'src/telegram-auth/repositories/telegram-users.repository';

@Injectable()
export class NotificationsService {
  private logger = new Logger(NotificationsService.name);

  constructor(
    private env: ConfigService,
    @InjectRepository(TelegramUsersRepository)
    private telegramUsersRepository: TelegramUsersRepository,
  ) {}

  async sendNotification(alert: Alert): Promise<void> {
    const telegramBotToken: string = this.env.get<string>('TELEGRAM_BOT_TOKEN');
    const url: string = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    try {
      const telegramId: string = await this.getTelegramId(alert.user_id);
      const message = `Price alert! ${alert.token.toUpperCase()} value just went ${alert.direction} ${alert.target_price}`;

      //send notification to user
      const response = await axios.post(url, {
        chat_id: telegramId,
        text: message,
      });

      //message is sent
      if (response.data.ok) {
        this.logger.log(`Notification sent to Telegram ID ${telegramId}`);
      } else {
        //message was not sent
        this.logger.error(
          `Failed to send notification: ${response.data.description}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send notification for user ${alert.user_id}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Error sending telegram notification',
      );
    }
  }

  private async getTelegramId(userId: string): Promise<string> {
    try {
      //find user
      const telegramUser = await this.telegramUsersRepository.findOne({
        where: { user_id: userId },
      });

      if (!telegramUser) {
        throw new InternalServerErrorException('Couldnt find telegram user');
      }

      return telegramUser.id.toString();
    } catch (error) {
      this.logger.error(
        `Failed to find telegram user for user with id ${userId}: ${error}`,
      );
      throw new InternalServerErrorException('Error finding telegram user');
    }
  }
}
