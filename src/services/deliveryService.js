import delay from "../utils/delay.js";
import dotenv from "dotenv";
import now from '../utils/now.js'
import { bot } from '../bot/teleBot.js'
import { getSubscribers } from '../data/DB.js'
import { app } from '../app.js'
dotenv.config({ path: "../.env" });

const deliverReport = async (reportQueue) => {
  let queueData ;
  while ((queueData = reportQueue.dequeue()) !== null && queueData.data !== null) {
    try{
      const result = {...queueData};
      const service_id  = [...app.get('allServices')].find(
        ([_, service_nm]) => {
        return service_nm.replace(/\s+/g, '') === result.type.replace(/\s+/g, '')
      }
      )[0]
      const subscribers = await getSubscribers(service_id)
      for (let data of subscribers ){
        bot.sendMessage(data.user_id, result.data);
        console.log('sending: ',data.user_id, result.data)
      }   
      result.logs.push('[4]delivery: ' + '전송 성공' + now())
      console.log(result);
    }catch(err){
      console.log('deliverReport error: ',err)
    }
  }
  await delay(0);
  deliverReport(reportQueue);
};

export default deliverReport;

