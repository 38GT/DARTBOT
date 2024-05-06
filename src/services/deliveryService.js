import delay from "../utils/delay.js";
import dotenv from "dotenv";
import now from '../utils/now.js'
import { bot } from '../bot/teleBot.js'
import { getSubscribers } from '../data/DB.js'
dotenv.config({ path: "../.env" });
const CHAT_ID = process.env.CHAT_ID;

const deliverReport = async (reportQueue) => {
  let queueData ;
  let dartData ; 
  while ((queueData = reportQueue.dequeue()) !== null && (dartData = queueData.data) !== null) {
    try{
      console.log('queueData: ', queueData)
      console.log('queueData.data.type: ', queueData.type)
      const subscribers = await getSubscribers(queueData.type)
      console.log('구독자들: ', subscribers)
      for (let data of subscribers ){
        console.log('user: ',data.user_id)
        bot.sendMessage(data.user_id, queueData.data, {
          parseMode: "html",
        });
      }   
      queueData.logs.push('[4]delivery: ' + '전송 성공' + now())
      console.log(queueData);
    }catch(err){
    }
  }
  await delay(0);
  deliverReport(reportQueue);
};

export default deliverReport;

