import { AuthGuard } from '@nestjs/passport';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AddAlertDto } from './dto/add-alert.dto';
import { GetUser } from 'src/shared/decorators/get-user.decorator';
import { User } from 'src/shared/entities/user.entity';
import { AlertsService } from './alerts.service';
import { AlertData } from './interfaces/alert-data.interface';

@Controller('alerts')
@UseGuards(AuthGuard())
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Post('new')
  createAlert(@GetUser() user: User, @Body() payload: any): Promise<void> {
    const data = payload.data;
    const dto = Object.assign(new AddAlertDto(), data);
    return this.alertsService.createNewAlert(user.id, dto);
  }

  @Get('user-alerts')
  getUserAlerts(@GetUser() user: User): Promise<AlertData[]> {
    return this.alertsService.getUserAlerts(user.id);
  }

  @Put(':id/activate')
  async activateAlert(@Param('id') id: number): Promise<void> {
    await this.alertsService.updateAlertStatus(id);
  }

  @Delete(':id')
  async deleteAlert(@Param('id') id: number): Promise<void> {
    await this.alertsService.deleteAlert(id);
  }
}
