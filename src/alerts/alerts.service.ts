import { AlertData } from './interfaces/alert-data.interface';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AddAlertDto } from './dto/add-alert.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AlertsRepository } from './repositories/alerts.repository';
import { Alert } from './entities/alert.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ExrateResponse } from 'src/price-tracker/interfaces/exrate-response.interface';
import { lastValueFrom } from 'rxjs';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CoinsRepository } from './repositories/coins.repository';
import { Coin } from './entities/coin.entity';
import { CoinMetrics } from './interfaces/coin-metrics.interface';
import { CoinPrice } from './interfaces/coin-price.interface';
import { AlertTokenData } from './interfaces/alert-token-data.interface';

@Injectable()
export class AlertsService {
  private logger = new Logger(AlertsService.name);

  constructor(
    private env: ConfigService,
    private http: HttpService,
    private notificationsService: NotificationsService,
    @InjectRepository(AlertsRepository)
    private alertsRepository: AlertsRepository,
    @InjectRepository(CoinsRepository)
    private coinsRepository: CoinsRepository,
  ) {}

  async createNewAlert(
    userId: string,
    addAlertDto: AddAlertDto,
  ): Promise<void> {
    const { token, target_price, direction, active, is_triggered } =
      addAlertDto;
    const newAlert = this.alertsRepository.create({
      token,
      target_price,
      direction,
      user_id: userId,
      active,
      is_triggered,
    });

    try {
      await this.alertsRepository.save(newAlert);
    } catch (error) {
      this.logger.error(
        `Failed to create alert for ${token} at price ${target_price}: ${error}`,
      );
      throw new InternalServerErrorException('Error saving token alert.');
    }
  }

  async getUserAlerts(userId: string): Promise<AlertData[]> {
    try {
      const response: Alert[] = await this.alertsRepository.find({
        where: { user_id: userId },
      });

      //handle async operation within map
      const alerts: AlertData[] = await Promise.all(
        response.map(async (item: Alert) => {
          const metadata: AlertTokenData = await this.addDataForToken(
            item.token,
          );
          return {
            id: item.id,
            symbol: metadata.symbol,
            name: metadata.name,
            icon: metadata.icon,
            price: metadata.price,
            change: metadata.change,
            target_price: item.target_price,
            direction: item.direction,
            user_id: item.user_id,
            active: item.active,
            is_triggered: item.is_triggered,
            created_at: item.created_at,
          } as AlertData;
        }),
      );

      return alerts;
    } catch (error) {
      this.logger.error(
        `Failed to get alerts of user ${userId} from database: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Error fetching user alerts from database',
      );
    }
  }

  async updateAlertStatus(id: number): Promise<void> {
    try {
      await this.alertsRepository.update(id, { active: true });
      this.logger.log(`Alert ${id} has been activated.`);
    } catch (error) {
      this.logger.error(`Failed to activate alert ${id}: ${error.message}`);
      throw new InternalServerErrorException(
        `Error actiating alert with id: ${id}`,
      );
    }
  }

  async deleteAlert(id: number): Promise<void> {
    try {
      const result = await this.alertsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Alert with ID ${id} not found.`);
      }
      this.logger.log(`Alert ${id} has been deleted.`);
    } catch (error) {
      this.logger.error(`Failed to delete alert ${id}: ${error.message}`);
      throw new InternalServerErrorException(
        `Error deleting alert with id: ${id}`,
      );
    }
  }

  async processActiveAlerts(): Promise<void> {
    //get all active alerts from db
    const activeAlerts: Alert[] = await this.alertsRepository.find({
      where: { active: true },
    });

    //check current price for every alert
    for (const alert of activeAlerts) {
      //fetch current price
      const currentPrice: number = await this.fetchAssetPrice(alert.token);
      //check if the target is reached
      const shouldTrigger =
        (alert.direction === 'above' && currentPrice >= alert.target_price) ||
        (alert.direction === 'below' && currentPrice <= alert.target_price);

      if (shouldTrigger) {
        await this.triggerAlert(alert);
      }
    }
  }

  async fetchAssetPrice(token: string): Promise<number> {
    const url: string = this.env.get<string>('COINAPI_URL');
    const key: string = this.env.get<string>('COINAPI_KEY');

    const headers = {
      'X-CoinAPI-Key': key,
    };
    try {
      const response = await lastValueFrom(
        this.http.get<ExrateResponse>(`${url}/exchangerate/${token}/USDT`, {
          headers,
        }),
      );
      return response.data.rate;
    } catch (error) {
      this.logger.error(`Failed to fetch exchange rate for ${token}: ${error}`);
      throw new InternalServerErrorException(
        'Error fetching current exchange rate',
      );
    }
  }

  async triggerAlert(alert: Alert): Promise<void> {
    alert.active = false;
    try {
      await this.alertsRepository.save(alert);
    } catch (error) {
      this.logger.error(
        `Failed to change alert ${alert.id} status to inactive: ${error}`,
      );
      throw new InternalServerErrorException('Error changing alert status');
    }

    //trigger notification
    this.notificationsService.sendNotification(alert);
  }

  private async addDataForToken(token: string): Promise<AlertTokenData> {
    //get all coingecko ids for token
    const ids: string[] = await this.getCoinIdsByTicker(token);

    //fetch metadata and coin price
    const marketData: CoinMetrics = await this.getMetadataForCoins(ids);
    const coinPriceData: CoinPrice = await this.getPriceDataForCoin(
      marketData.id,
    );

    const tokenData: AlertTokenData = {
      symbol: marketData.symbol,
      name: marketData.name,
      icon: marketData.image,
      price: coinPriceData.usd,
      change: coinPriceData.usd_24h_change,
    };

    return tokenData;
  }

  private async getCoinIdsByTicker(ticker: string): Promise<string[]> {
    //get all coins with appropriate ticker
    try {
      const coins: Coin[] = await this.coinsRepository.find({
        where: { symbol: ticker.toLowerCase() },
      });
      //extract ids
      const ids: string[] = coins.map((coin) => coin.coingeckoId);
      return ids;
    } catch (error) {
      this.logger.error('Failed to get token ids by ticker', error);
    }
  }

  async getMetadataForCoins(ids: string[]): Promise<CoinMetrics> {
    const url: string = this.env.get<string>('COINGECKO_BASE_URL');
    const key: string = this.env.get<string>('COINGECKO_API_KEY');

    //add authentication header
    const headers = {
      'x-cg-demo-api-key': key,
    };
    //compose params
    const params = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      ids: ids.join(','),
    };
    try {
      //fetch from api
      const response = await lastValueFrom(
        this.http.get<CoinMetrics[]>(`${url}/coins/markets`, {
          headers,
          params,
        }),
      );
      return response.data[0]; //token with highest mcap
    } catch (error) {
      this.logger.error(
        'Error fetching data from coingecko metadata api:',
        error.message,
      );
      throw error;
    }
  }

  async getPriceDataForCoin(id: string): Promise<CoinPrice> {
    const url: string = this.env.get<string>('COINGECKO_BASE_URL');
    const key: string = this.env.get<string>('COINGECKO_API_KEY');

    //add authentication header
    const headers = {
      'x-cg-demo-api-key': key,
    };
    //add parameters
    const params = {
      ids: id,
      vs_currencies: 'usd',
      include_market_cap: false,
      include_24hr_vol: true,
      include_24hr_change: true,
    };
    try {
      const response = await lastValueFrom(
        this.http.get<CoinPrice>(`${url}/simple/price`, { headers, params }),
      );
      return response.data[id];
    } catch (error) {
      this.logger.error(
        'Error fetching data from coingecko simple price api:',
        error.message,
      );
      throw error;
    }
  }
}
