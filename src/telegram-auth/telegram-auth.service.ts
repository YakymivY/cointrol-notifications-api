import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TelegramUser } from './interfaces/telegram-user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramUsersRepository } from './repositories/telegram-users.repository';

@Injectable()
export class TelegramAuthService {
  private logger = new Logger(TelegramAuthService.name);
  constructor(
    @InjectRepository(TelegramUsersRepository)
    private telegramUsersRepository: TelegramUsersRepository,
  ) {}

  async saveTelegramUser(user: TelegramUser, userId: string): Promise<void> {
    const { id, first_name, last_name, username, photo_url } = user;
    const existingTgUser = await this.telegramUsersRepository.findOne({
      where: { id },
    });
    if (existingTgUser) {
      throw new BadRequestException('This telegram user is already registered');
    } else {
      const tgUser = this.telegramUsersRepository.create({
        id,
        first_name,
        last_name,
        username,
        photo_url,
        user_id: userId,
      });
      try {
        await this.telegramUsersRepository.save(tgUser);
      } catch (error) {
        this.logger.error(
          `Failed to save tg user ${id} for the user ${userId}: ${error}`,
        );
        throw new InternalServerErrorException('Error saving telegram user');
      }
    }
  }

  async findTelegramAccount(userId: string): Promise<TelegramUser> {
    try {
      const telegramUser = await this.telegramUsersRepository.findOne({
        where: { user_id: userId },
      });

      if (!telegramUser) {
        throw new BadRequestException(
          'Telegram account for the user does not exist',
        );
      }

      return telegramUser;
    } catch (error) {
      this.logger.error(
        `Failed to find telegram account of user ${userId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Error finding telegram account of user',
      );
    }
  }
}
