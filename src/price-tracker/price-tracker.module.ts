import { forwardRef, Module } from '@nestjs/common';
import { PriceTrackerService } from './price-tracker.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertsModule } from 'src/alerts/alerts.module';

@Module({
  imports: [ScheduleModule.forRoot(), forwardRef(() => AlertsModule)],
  providers: [PriceTrackerService],
  exports: [PriceTrackerService],
})
export class PriceTrackerModule {}
