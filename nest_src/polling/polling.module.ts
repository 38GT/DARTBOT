import { Module } from '@nestjs/common';
import { PollingService } from './polling.service';
import { StateManagerModule } from 'src/state-manager/state-manager.module';

@Module({
  imports: [StateManagerModule],
  providers: [PollingService],
  exports: [PollingService],
})
export class PollingModule {}
