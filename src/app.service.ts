import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SmartContractService } from './app/services/smart-contract/smart-contract.service';

@Injectable()
export class AppService {
  constructor(private smartContractService: SmartContractService) {}

  private readonly logger = new Logger(AppService.name);

  async getHello() {
    return 'up';
  }

  moralisWebhook(data) {
    this.smartContractService.moralisWebhook(data);
  }
}
