import express from "express";
import Queue from "./utils/Queue.js";
import { bootstrapping } from "./services/bootstrapping.js";
import { pollingDARTdata } from "./services/dartApiService.js";
import { reportPublishing } from "./services/publishingService.js";
import deliverReport from "./services/deliveryService.js";
const app = express();

/*
큐 채워져있는 실시간 상황 보여주는 간단한 로그 시스템 만들면 좋을 듯
리포트 말고도 처음에 엄청나게 쏟아지는 값들을 재정비해주는 초기화도 필요해보임
초기화: node 인스턴스 재부팅 후 쏟아지는 거 정리하는 기능
초기화: 각 보고서별 목록 초기화


  퀘스트: URL마다 가능한 보고서 제목 리스트 뽑아주는 자동화 코드 짜기 
  세부사항:
    (1) URL,파일 저장 위치 string을 파라미터로 받는 함수
    (2) 실행시키면 리스트 json 파일 생성
*/

const main = async () => {
  const dartQueue = new Queue();
  const reportQueue = new Queue();
  await bootstrapping();
  pollingDARTdata(dartQueue, 60000);
  reportPublishing(dartQueue, reportQueue);
  deliverReport(reportQueue);
};

main();

app.listen(3000, () => console.log("\x1b[31m", "DART알리미 test_server_start"));
