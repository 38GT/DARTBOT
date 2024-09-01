import { Global, Module } from '@nestjs/common';
import { StateManagerService } from './state-manager.service';
import { PublishingService } from 'src/publishing/publishing.service';
import { PollingService } from 'src/polling/polling.service';

@Global()
@Module({
  imports: [],
  providers: [StateManagerService, PollingService, PublishingService],
  exports: [StateManagerService],
})
export class StateManagerModule {}
