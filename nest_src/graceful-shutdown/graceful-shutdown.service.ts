import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Server } from 'http';

/*

작동 원리
우아하게 종료하기 위한 네 가지 단계를 소개합니다.

프로세스 종료 신호 처리
클라이언트의 새 요청 중지
모든 데이터 처리 종료
프로세스 종료

*/

@Injectable()
export class GracefulShutdownService implements OnModuleInit {
  private readonly logger = new Logger(GracefulShutdownService.name);
  private server: Server;

  constructor() {}

  onModuleInit() {
    this.setupShutdownHandlers();
  }

  public setServer(server: Server) {
    this.server = server;
  }

  private setupShutdownHandlers() {
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
    process.on('uncaughtException', (err) => this.handleUncaughtException(err));
    process.on('unhandledRejection', (reason, promise) =>
      this.handleUnhandledRejection(reason, promise),
    );
  }

  private gracefulShutdown(signal: string) {
    this.logger.log(`Received ${signal}. Shutting down gracefully...`);

    if (this.server) {
      this.server.close(() => {
        this.logger.log('HTTP server closed.');
        // Here you can close other connections or perform cleanup
        process.exit(0);
      });

      // Force close server after 5 seconds
      setTimeout(() => {
        this.logger.error(
          'Could not close connections in time, forcefully shutting down',
        );
        process.exit(1);
      }, 5000);
    } else {
      process.exit(0);
    }
  }

  private handleUncaughtException(error: Error) {
    this.logger.error('Uncaught Exception:', error.stack);
    this.gracefulShutdown('uncaughtException');
  }

  private handleUnhandledRejection(reason: any, promise: Promise<any>) {
    this.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    this.gracefulShutdown('unhandledRejection');
  }
}
//1. 컨테이너가 갑작스럽게 종료되는 경우
//2. 컨테이너 내부 인스턴스가 갑작스럽게 종료되는 경우
