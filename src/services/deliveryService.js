import TelegramBot from "node-telegram-bot-api";
import delay from "../utils/delay.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const CHAT_ID = process.env.CHAT_ID;
const TELE_TOKEN = process.env.TELE_TOKEN;
const bot = new TelegramBot(TELE_TOKEN, { polling: true });

const deliverReport = async (reportQueue) => {
  let report;

  while ((report = reportQueue.dequeue()) !== null) {
    console.log(report);
    bot.sendMessage(CHAT_ID, report, {
      parse_mode: "HTML",
    });
  }
  await delay(10000);
  deliverReport(reportQueue);
};

export default deliverReport;
