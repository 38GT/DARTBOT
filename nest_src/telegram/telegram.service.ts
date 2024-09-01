import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'events';
import { DisclosureDto } from 'src/dto/disclosure.dto';
import * as TelegramBot from 'node-telegram-bot-api';
import { ConfigService } from '@nestjs/config';
import { DisclosureState } from 'src/enum/disclosure-state.enum';
import { StateManagerService } from 'src/state-manager/state-manager.service';
import { delay } from 'src/utils/delay';

@Injectable()
export class TelegramService extends EventEmitter implements OnModuleInit {
  private readonly TELE_TOKEN =
    this.configService.get<string>('TELE_TOKEN_TEST2');
  private bot: TelegramBot | undefined;
  private isInitialized: boolean = false;
  private queue: DisclosureDto[] = [];
  private processingQueue: boolean = false;

  constructor(
    private configService: ConfigService,
    private stateManagerService: StateManagerService,
  ) {
    super();
  }

  async onModuleInit() {
    try {
      this.bot = new TelegramBot(this.TELE_TOKEN, { polling: true });
      this.bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        console.log(`Chat ID: ${chatId}`);
      });
      this.isInitialized = true;
      console.log(
        '[BOOTSTRAPING] [SUCCESS] Telegram bot initialized successfully',
      );
    } catch (err) {
      console.error(
        '[BOOTSTRAPING] [FAILED] Failed to initialize Telegram bot:',
        err,
      );
    }
  }

  public async processData(data: DisclosureDto) {
    // 봇 초기화가 완료될 때까지 대기
    await this.ensureBotInitialized();

    if (!this.bot) {
      console.error('Telegram bot is not initialized');
      return;
    }

    // 작업을 큐에 추가
    this.queue.push(data);

    // 큐가 이미 처리 중이 아니면 시작
    if (!this.processingQueue) {
      this.processQueue();
    }
  }

  private async processQueue() {
    this.processingQueue = true;

    while (this.queue.length > 0) {
      const data = this.queue.shift(); // 큐에서 작업을 꺼냄

      if (data) {
        try {
          await this.bot.sendMessage(5055393233, JSON.stringify(data.report));

          this.stateManagerService.setDisclosureState(
            data.rcept_no,
            DisclosureState.TELEGRAM_SUCCESS,
          );
          console.log(
            `PROCESSING: [${DisclosureState.TELEGRAM_SUCCESS}], rcept_no: ${data.rcept_no}`,
          );
          this.emit('processingComplete', data);
        } catch (err) {
          console.error('Error sending Telegram message:', err);

          this.stateManagerService.setDisclosureState(
            data.rcept_no,
            DisclosureState.TELEGRAM_FAILED,
          );
          console.log(
            `PROCESSING: [${DisclosureState.TELEGRAM_FAILED}], rcept_no: ${data.rcept_no}`,
          );
          this.emit('processingComplete', data); // Fail gracefully
        }
      }

      // 다음 메시지를 보내기 전에 200ms 대기
      delay(200);
    }
    this.processingQueue = false; // 큐 처리 완료
  }

  private async ensureBotInitialized() {
    while (!this.isInitialized) {
      console.log('Waiting for Telegram bot to initialize...');
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms 대기
    }
  }
}
