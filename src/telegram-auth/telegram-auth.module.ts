import { Module } from '@nestjs/common';
import { TelegramAuthService } from './telegram-auth.service';
import { TelegramAuthController } from './telegram-auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramUsers } from './entities/telegram-users.entity';
import { TelegramUsersRepository } from './repositories/telegram-users.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([TelegramUsers]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [TelegramAuthService, TelegramUsersRepository],
  controllers: [TelegramAuthController],
})
export class TelegramAuthModule {}
