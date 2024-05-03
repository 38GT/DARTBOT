import { DART } from "../api/DART.js";
import delay from "../utils/delay.js";
export async function pollingDARTdata(queue, period) {
  try {
    const new_list = await DART.fetch_data();
    if(new_list[0].data === null) return;
    // await delay(20 * 60 * 100)
    DART.new_list.forEach((data) => {
      console.log('test6: ', data)
      queue.enqueue(data);
    });
    DART.new_list = [];
  } catch (err) {
    console.error("DART polling 에러", err);
    /* 실패한 경우 DART.new_list 안에 에러메세지 같은게 들어 있으면 어떻게 하지? 이것 처리해야할 것으로 보인다. */
  } finally {
    setTimeout(() => pollingDARTdata(queue, period), period);
  }
}
