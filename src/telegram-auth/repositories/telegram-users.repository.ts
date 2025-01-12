import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TelegramUsers } from '../entities/telegram-users.entity';

@Injectable()
export class TelegramUsersRepository extends Repository<TelegramUsers> {
  constructor(private dataSource: DataSource) {
    super(TelegramUsers, dataSource.createEntityManager());
  }
}
