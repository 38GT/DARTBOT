import { DART } from "../api/DART.js";
import today from '../utils/today.js';
import now from '../utils/now.js';
import delay from '../utils/delay.js'
export async function pollingDARTdata(queue, period) {
  try {
    const old_list = [...DART.today_list]
    let new_list = await DART.fetch_data();
    if(new_list === undefined){
      DART.today_list = old_list;
      return;
    }
    new_list.forEach((item) => {
      if(item.data) queue.enqueue(item);
    });
    DART.new_list = [];
  } catch (err) {
    console.error("DART polling 에러", err);
    /* 실패한 경우 DART.new_list 안에 에러메세지 같은게 들어 있으면 어떻게 하지? 이것 처리해야할 것으로 보인다. */
  } finally {
    setTimeout(() => pollingDARTdata(queue, period), period);
  }
}

export async function testPolling (dartQueue, period){
  const testData = {
    corp_cls:'Y',
    corp_name: 'test_corp',
    corp_code: '37341756',
    stock_code: '1756',
    report_nm: '주식등의대량보유상황보고서',
    rcept_no: '17561756',
    flr_nm: '최진혁',
    rcept_dt : today,
    rm:'유'
  }
  const testData2 = {
    corp_cls:'Y',
    corp_name: 'test_corp2',
    corp_code: '373417562',
    stock_code: '17562',
    report_nm: '임원ㆍ주요주주 특정증권등 소유상황보고',
    rcept_no: '17561752',
    flr_nm: '최진혁',
    rcept_dt : today,
    rm:'유'
  }
  dartQueue.enqueue({id: 'testId', corp: 'testCorp', type: testData.report_nm, data: testData, logs: ['[1]testPolling: ' + now()]})
  dartQueue.enqueue({id: 'testId2', corp: 'testCorp2', type: testData2.report_nm, data: testData2, logs: ['[1]testPolling: ' + now()]})
  await delay(period);
  testPolling(dartQueue,period)
}

