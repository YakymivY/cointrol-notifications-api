import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/shared/decorators/get-user.decorator';
import { User } from 'src/shared/entities/user.entity';
import * as crypto from 'crypto';
import { TelegramAuthService } from './telegram-auth.service';
import { AuthGuard } from '@nestjs/passport';
import { TelegramUser } from './interfaces/telegram-user.interface';

@Controller('telegram-auth')
@UseGuards(AuthGuard())
export class TelegramAuthController {
  constructor(private telegramUserService: TelegramAuthService) {}

  @Post('')
  async telegramAuth(
    @GetUser() ogUser: User,
    @Body() payload: any,
  ): Promise<any> {
    const { hash, ...data } = payload.user;
    const secretKey = crypto
      .createHash('sha256')
      .update('7011834532:AAHGXleTDib66g96mVfARaa17RS6jh10r6I')
      .digest();

    //verify signature
    const checkString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join('\n');
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');

    if (hmac !== hash) {
      throw new BadRequestException('Invalid Telegram signature');
    }
    try {
      await this.telegramUserService.saveTelegramUser(data, ogUser.id);
      return { message: 'Authentication successful', data };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; //rethrow
      }
      //for any other errors, return InternalServerError
      throw new InternalServerErrorException('Error saving telegram user');
    }
  }

  @Get('')
  async getUserTelegramAccount(@GetUser() user: User): Promise<TelegramUser> {
    return this.telegramUserService.findTelegramAccount(user.id);
  }
}
