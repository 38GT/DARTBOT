import TelegramBot from "node-telegram-bot-api";
import delay from "../utils/delay.js";
import dotenv from "dotenv";
import now from '../utils/now.js'
dotenv.config({ path: "../.env" });
const CHAT_ID = process.env.CHAT_ID;
const TELE_TOKEN = process.env.TELE_TOKEN;
const bot = new TelegramBot(TELE_TOKEN, { polling: true });

const deliverReport = async (reportQueue) => {
  let queueData ;
  let dartData ; 
  while ((queueData = reportQueue.dequeue()) !== null && (dartData = queueData.data) !== null) {
    try{
      bot.sendMessage(CHAT_ID, JSON.stringify(dartData), {
        parse_mode: "HTML",
      });
      queueData.logs.push('[4]delivery: ' + '전송 성공' + now())
    }catch(err){
    }
  }
  await delay(0);
  deliverReport(reportQueue);
};

export default deliverReport;


// 순환 참조 대체를 위한 함수
function getCircularReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
}