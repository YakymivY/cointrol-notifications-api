import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Alert } from '../entities/alert.entity';

@Injectable()
export class AlertsRepository extends Repository<Alert> {
  constructor(private dataSource: DataSource) {
    super(Alert, dataSource.createEntityManager());
  }
}
