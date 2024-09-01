import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PollingModule } from './polling/polling.module';
import { StateManagerModule } from './state-manager/state-manager.module';
import { HealthCheckService } from './health-check/health-check.service';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PublishingModule } from './publishing/publishing.module';
import { TelegramModule } from './telegram/telegram.module';
import { QueueManagerModule } from './queue-manager/queue-manager.module';
@Module({
  imports: [
    PollingModule,
    StateManagerModule,
    PublishingModule,
    TelegramModule,
    ConfigModule.forRoot({
      isGlobal: true, // 글로벌 모듈로 설정하여 모든 모듈에서 사용 가능
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    QueueManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

/*
1. PollingModule: DART API 폴링 관련 기능을 담당합니다.
2. ConfigModule: 설정 관리 및 주기, 시작, 끝 시간 등의 입력을 담당합니다.

1. 공통모듈
    1. HealthCheckModule: 헬스 체크 모듈
    2. LoggingModule: 로깅 모듈
    3. MQ 모듈: ForwardingModule: 데이터 포워딩 관련 기능을 담당합니다.
    4. StateManagementModule : update같은 걸 하기, stateMagement.update()
    5. GracefulShutdownModule: 갑작스런 인스턴스, 컨테이너 종료시 처리하는 로직	
*/
