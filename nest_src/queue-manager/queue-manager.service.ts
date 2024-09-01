import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { RedisClientType, createClient } from 'redis';
import { DisclosureDto } from 'src/dto/disclosure.dto';
import { DisclosureState } from 'src/enum/disclosure-state.enum';
import { PollingService } from 'src/polling/polling.service';
import { PublishingService } from 'src/publishing/publishing.service';
import { StateManagerService } from 'src/state-manager/state-manager.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { debug } from 'src/utils/debug';
import { delay } from 'src/utils/delay';

@Injectable()
@Processor('taskQueue')
export class QueueManagerService implements OnModuleInit {
  private redisClient: RedisClientType;

  constructor(
    @InjectQueue('taskQueue') private readonly taskQueue: Queue,
    private pollingService: PollingService,
    private publishingService: PublishingService,
    private telegramService: TelegramService,
    private stateManager: StateManagerService,
  ) {
    this.setupQueueingListeners();
  }

  async onModuleInit() {
    // Redis 클라이언트 초기화
    this.redisClient = createClient();
    await this.redisClient.connect();
    this.pollingService.on('processingComplete', (data) =>
      this.enqueueJobs(data),
    );
    this.publishingService.on('processingComplete', (data) =>
      this.enqueueJobs(data),
    );
    this.telegramService.on('processingComplete', (data) =>
      this.enqueueJobs(data),
    );
  }

  @Process('processDisclosure')
  private async processQueueJobs(job: Job<DisclosureDto>) {
    const data = job.data;
    const status = this.stateManager.getDisclosureState(data.rcept_no);
    if (status === DisclosureState.POLLING_SUCCESS) {
      await this.publishingService.processData(data);
    } else if (status === DisclosureState.PUBLISHING_SUCCESS) {
      await this.telegramService.processData(data);
    } else if (status === DisclosureState.TELEGRAM_SUCCESS) {
      this.stateManager.setDisclosureState(
        data.rcept_no,
        DisclosureState.ALL_SUCCESS,
      );
    } else {
      await job.remove();
    }
  }

  private setupQueueingListeners() {
    this.taskQueue.on('completed', (job: Job<DisclosureDto>) => {
      const data = job.data;
      const status = this.stateManager.getDisclosureState(data.rcept_no);
      console.log(`QUEUEING COMPLETE: [${status}] rcept_no:${data.rcept_no}`);
    });

    this.taskQueue.on('failed', async (job: Job<DisclosureDto>, err: Error) => {
      const data = job.data;
      const status = this.stateManager.getDisclosureState(data.rcept_no);
      console.log(
        err,
        `QUEUEING FAILED: [${status}] rcept_no:${data.rcept_no}`,
      );
      this.stateManager.setDisclosureState(
        data.rcept_no,
        DisclosureState.QUEUEING_FAILED,
      );
    });
  }

  private async enqueueJobs(data: DisclosureDto | DisclosureDto[]) {
    // data가 배열인지 확인하고, 배열이 아닌 경우 단일 요소로 처리
    const dataArray = Array.isArray(data) ? data : [data];
    for (let disclosure of dataArray) {
      const rcept_no = disclosure.rcept_no;
      debug({ rcept_no });
      await this.taskQueue.add('processDisclosure', disclosure, {
        attempts: 5, // 최대 재시도 횟수
        backoff: 5000, // 재시도 간격 (밀리초, 5초)
      });
    }
  }
}
