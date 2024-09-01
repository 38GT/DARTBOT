import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueManagerService } from './queue-manager.service';
import { PollingModule } from 'src/polling/polling.module';
import { PublishingModule } from 'src/publishing/publishing.module';
import { TelegramModule } from 'src/telegram/telegram.module';
import { StateManagerModule } from 'src/state-manager/state-manager.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'taskQueue', // 여기에 taskQueue를 등록
    }),
    PollingModule,
    PublishingModule,
    TelegramModule,
  ],
  providers: [QueueManagerService],
})
export class QueueManagerModule {}
