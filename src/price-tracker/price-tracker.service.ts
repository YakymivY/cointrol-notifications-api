import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertsService } from './../alerts/alerts.service';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PriceTrackerService {
  private logger = new Logger(PriceTrackerService.name);
  constructor(
    @Inject(forwardRef(() => AlertsService))
    private alertsService: AlertsService,
  ) {}

  //schedule the execution for every 10 sec
  // @Cron(CronExpression.EVERY_10_SECONDS)
  // async checkAlerts() {
  //   try {
  //     await this.alertsService.processActiveAlerts();
  //     this.logger.log('Alerts checked successfully.');
  //   } catch (error) {
  //     this.logger.error('Error checking alerts:', error);
  //   }
  // }
}
