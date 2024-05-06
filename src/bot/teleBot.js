import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const TELE_TOKEN = process.env.TELE_TOKEN;
export const bot = new TelegramBot(TELE_TOKEN, { polling: true });