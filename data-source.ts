import { Alert } from 'src/alerts/entities/alert.entity';
import { Coin } from 'src/alerts/entities/coin.entity';
import { User } from 'src/shared/entities/user.entity';
import { TelegramUsers } from 'src/telegram-auth/entities/telegram-users.entity';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'yuriyyakymiv',
  password: '1111',
  database: 'cointrol',
  entities: [User, Alert, TelegramUsers, Coin],
  synchronize: true,
});

export default AppDataSource;
