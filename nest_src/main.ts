import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule); // 기본 HTTP 서버 사용

    await app.listen(3000, () => {
      console.log('Server is listening on port 3000');
      // 서버가 시작된 이후에 실행할 작업
      console.log(2);
    });
  } catch (error) {
    console.error('Error during bootstrap:', error);
  }
  console.log('1초 딜레이');
  console.log('Bootstrap completed');
}

console.log(1);
bootstrap();
console.log(3);
